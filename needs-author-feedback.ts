import { appendFile, glob, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { $ } from 'bun';

// `bun needs-author-feedback.ts [author]` triages the author's open winget-pkgs PRs labelled Needs-Author-Feedback.
// Labels are unreliable (most Defender errors are the validation VM failing to run its own scan), so it reads the
// validation results zip and the bot comments. Prints `<pr>\t<attempt>\t<package>\t<verdict>\t<details>`.
// needs-author-feedback.tsv holds handled PRs: a PR is skipped until it has a newer validation attempt. Rows that
// need no manifest change are appended automatically; add `fixed` rows by hand after pushing a fix.
const STATE = 'needs-author-feedback.tsv';
const author = process.argv[2] ?? 'pl4nty';

const handled = new Map<number, number>();
for (const row of (await readFile(STATE, 'utf8').catch(() => '')).trim().split('\n').slice(1)) {
	const [pr, attempt] = row.split('\t');
	if (pr) handled.set(Number(pr), Math.max(Number(attempt), handled.get(Number(pr)) ?? 0));
}

type Issue = { number: number; title: string };
const prs: Issue[] = [];
for (let page = 1; ; page++) {
	const q = `repo:microsoft/winget-pkgs is:pr is:open author:${author} label:Needs-Author-Feedback`;
	const { items }: { items: Issue[] } =
		await $`gh api -X GET search/issues -f q=${q} -f per_page=100 -f page=${page}`.json();
	prs.push(...items);
	if (items.length < 100) break;
}

type Comment = { user: { login: string; type: string }; body: string };
type Fields = { FieldsMetadata?: { Field: string; Message?: string }[] };
const field = (fields: Fields | undefined, name: string) =>
	fields?.FieldsMetadata?.find((f) => f.Field === name)?.Message;
const where = (fields: Fields | undefined) =>
	['Architecture', 'Scope', 'InstallerType'].map((name) => field(fields, name)).filter(Boolean).join(' ');
// Results JSON is UTF-8 with a BOM, MpCmdRun logs are UTF-16LE.
const text = (bytes: Buffer) =>
	(bytes[1] === 0 ? new TextDecoder('utf-16le').decode(bytes) : bytes.toString('utf8')).replace(/^﻿/, '');
const VERDICTS = ['needs fix', 'needs removal reason', 'manual review', 'validation VM problem'];

for (const { number, title } of prs) {
	// Comments need API access to microsoft/winget-pkgs; the results zips are public on the CDN.
	const response = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/issues/${number}/comments`.nothrow().quiet();
	const comments: Comment[] = response.exitCode ? [] : response.json().flat();
	const errors = comments.filter((c) => c.body.includes('Template: msftbot/validationError/')).length;
	const dir = await mkdtemp(join(tmpdir(), `naf-${number}-`));
	let zips = 0;
	while ((await $`curl -fsSLo ${dir}/${zips + 1}.zip ${`https://cdn.winget.microsoft.com/artifacts/WinGetSvc-Validation-${number}-${zips + 1}-artifacts.zip`}`.nothrow().quiet()).exitCode === 0)
		zips++;
	const attempt = Math.max(zips, errors);
	if ((handled.get(number) ?? -1) >= attempt) continue;

	const findings: [verdict: string, detail: string][] = [];
	if (zips) {
		const results = join(dir, String(zips));
		await $`unzip -oq ${results}.zip -d ${results}`.quiet();
		const read = async (pattern: string) => {
			const files: string[] = [];
			for await (const path of glob(pattern, { cwd: results })) files.push(text(await readFile(join(results, path))));
			return files;
		};
		const logs = new Map<string, string>();
		for await (const path of glob('InstallationVerificationLogs/*', { cwd: results }))
			logs.set(path.split('/').pop()!, path);
		for (const scan of await read('ValidationResult/*/*/InstallerScan_Result.json')) {
			const { OverallResult, Metadata } = JSON.parse(scan);
			if (OverallResult !== 'Success')
				findings.push(['needs fix', `installer scan ${OverallResult}: ${Metadata?.map((m: any) => m.Message?.trim()).join(' ')}`]);
		}
		for (const json of await read('ValidationResult/*/*/*_Result.json')) {
			const { TestPlansResults = [], AnalysisResults = [] } = JSON.parse(json);
			for (const plan of TestPlansResults) {
				if (plan.Result === 'Success') continue;
				const at = where(plan.ResultMetadata);
				const prefix = `${field(plan.ResultMetadata, 'Architecture')}-${field(plan.ResultMetadata, 'Scope') ?? 'Scope_Undefined'}-${field(plan.ResultMetadata, 'Locale') ?? 'Locale_Undefined'}-`;
				const log = (suffix: string) => [...logs].find(([name]) => name.startsWith(prefix) && name.includes(suffix))?.[1];
				if (plan.TestPlan === 'Validation-Defender-Error') {
					const analysis = log('MpCmdRunanalysis') ? text(await readFile(join(results, log('MpCmdRunanalysis')!))) : '';
					const threats = analysis.split(/\r?\n/).filter((line) => /threat/i.test(line) && !/0 threats/i.test(line));
					if (threats.length) findings.push(['needs fix', `${at}: Defender found ${threats.map((t) => t.trim()).join('; ')}`]);
					else if (analysis.includes('Another scan already in progress'))
						findings.push(['validation VM problem', `${at}: Defender's scan didn't start (another scan was already running), no threat reported`]);
					else findings.push(['validation VM problem', `${at}: Defender error without a detection${analysis ? '' : ' (no scan log)'}`]);
				} else if (plan.TestPlan === 'Validation-Executable-Error') {
					const runs = AnalysisResults.filter((a: any) => a.AnalysisType === 'ExeRunInfo' && where(a) === at)
						.flatMap((a: any) => Object.entries(a.Diagnostics ?? {}))
						.filter(([path, run]: any) => run.ExecutionStatusResult !== 'Success' && path.includes('WinGet'))
						.map(([path, run]: any) => `${path.split('\\').pop()} exit ${run.ExitCode}: ${(run.ErrorStream || run.OutputStream).split('\n')[0].trim()}`);
					findings.push([plan.Result === 'ManualReview' ? 'manual review' : 'needs fix', `${at}: executable check ${plan.Result}: ${[...new Set(runs)].join('; ')}`]);
				} else if (plan.TestPlan === 'Validation-Unattended-Failed') {
					findings.push(['needs fix', `${at}: install waited for user input until timeout, screenshot ${log('ErrorScreenshot') ?? 'missing'}`]);
				} else {
					findings.push(['needs fix', `${at}: ${plan.TestPlan} ${plan.Result}`]);
				}
			}
		}
	}
	for (const { user, body } of comments) {
		if (body.includes('Template: msftbot/highestVersionRemoval'))
			findings.push(['needs removal reason', 'removes the highest version; moderators want the reason']);
		else if (body.includes('Template: msftbot/authorAssist/manifestValidation'))
			findings.push(...body.split('\n').filter((line) => line.startsWith('> - ')).map((line) => ['needs fix', line.slice(4)] as [string, string]));
		else if (body.includes('Template: msftbot/validationError/manifest') || body.includes('Template: msftbot/validationError/internalError'))
			findings.push(['needs fix', body.match(/Template: (\S+)/)![1]!]);
		else if (user.login.startsWith('wingetvalidator'))
			findings.push(['manual review', body.split('\n').filter(Boolean).join(' ')]);
		else if (user.type === 'User' && user.login !== author && !body.includes('(Deterministic automation'))
			findings.push(['needs fix', `${user.login}: ${body.split('\n').find(Boolean)}`]);
	}
	if (!findings.length) findings.push(['needs fix', `no failure in ${zips ? 'results' : 'comments'}${comments.length ? '' : ', comments unreadable'}`]);

	const verdict = VERDICTS.find((v) => findings.some(([f]) => f === v))!;
	const details = [...new Set(findings.map(([, detail]) => detail))].join(' | ').replace(/\s+/g, ' ');
	const pkg = title.replace(/^(New|Update|Remove) version: (\S+) version (\S+).*$/, '$2 $3');
	console.log(`${number}\t${attempt}\t${pkg}\t${verdict}\t${details}`);
	if (verdict !== 'needs fix') await appendFile(STATE, `${number}\t${attempt}\t${verdict}\t${pkg}\n`);
}
