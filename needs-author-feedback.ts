import { glob, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { $ } from 'bun';

// `bun needs-author-feedback.ts [author]` triages the author's open winget-pkgs PRs labelled Needs-Author-Feedback or
// Manifest-Metadata-Consistency.
// Labels are unreliable (most Defender errors are the validation VM failing to run its own scan), so it reads the
// validation results zip and the bot comments. Prints `<pr url>\t<package>\t<labels>\t<verdict>\t<details>`. A push or an author
// comment removes the label, so fixed PRs drop out without any state.
const author = process.argv[2] ?? 'pl4nty';

type Issue = { number: number; title: string; labels: { name: string }[] };
const prs = new Map<number, Issue>();
for (const label of ['Needs-Author-Feedback', 'Manifest-Metadata-Consistency'])
	for (let page = 1; ; page++) {
		const q = `repo:microsoft/winget-pkgs is:pr is:open author:${author} label:${label}`;
		const { items }: { items: Issue[] } =
			await $`gh api -X GET search/issues -f q=${q} -f per_page=100 -f page=${page}`.json();
		for (const item of items) prs.set(item.number, item);
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

for (const { number, title, labels } of prs.values()) {
	// Comments need API access to microsoft/winget-pkgs; the results zips are public on the CDN.
	const response = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/issues/${number}/comments`.nothrow().quiet();
	const comments: Comment[] = response.exitCode ? [] : response.json().flat();
	const dir = await mkdtemp(join(tmpdir(), `naf-${number}-`));
	let zips = 0;
	while ((await $`curl -fsSLo ${dir}/${zips + 1}.zip ${`https://cdn.winget.microsoft.com/artifacts/WinGetSvc-Validation-${number}-${zips + 1}-artifacts.zip`}`.nothrow().quiet()).exitCode === 0)
		zips++;

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
				if (plan.Result === 'Success' || plan.Result === 'Waived') continue;
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
						.map(([path, run]: any) => `${path.split('\\').pop()} exit ${run.ExitCode}: ${(run.ErrorStream || run.OutputStream).split(/\r?\n/)[0].trim().slice(0, 120)}`);
					findings.push([plan.Result === 'ManualReview' ? 'manual review' : 'needs fix', `${at}: executable check ${plan.Result}: ${[...new Set(runs)].join('; ')}`]);
				} else if (plan.TestPlan === 'Validation-Installation-Error') {
					// 0x8019xxxx is winget's HTTP status error, so a 5xx or 429 is the download failing, not the installer.
					const code = Number(field(plan.ResultMetadata, 'Exit Code')) >>> 0;
					const status = code >>> 16 === 0x8019 ? code & 0xffff : 0;
					if (status >= 500 || status === 429)
						findings.push(['validation VM problem', `${at}: installer download failed with HTTP ${status}`]);
					else findings.push(['needs fix', `${at}: install failed, exit 0x${code.toString(16)}${status ? ` (HTTP ${status})` : ''}`]);
				} else if (plan.TestPlan === 'Validation-Unattended-Failed') {
					findings.push(['needs fix', `${at}: install waited for user input until timeout, screenshot ${log('ErrorScreenshot') ?? 'missing'}`]);
				} else {
					findings.push(['needs fix', `${at}: ${plan.TestPlan} ${plan.Result}`]);
				}
			}
		}
	}
	const reviews: [verdict: string, detail: string][] = [];
	for (const { user, body } of comments) {
		if (body.includes('Template: msftbot/highestVersionRemoval'))
			findings.push(['needs removal reason', 'removes the highest version; moderators want the reason']);
		else if (body.includes('Template: msftbot/authorAssist/manifestValidation'))
			findings.push(...body.split('\n').filter((line) => line.startsWith('> - ')).map((line) => ['needs fix', line.slice(4)] as [string, string]));
		else if (body.includes('Template: msftbot/validationError/internalError'))
			findings.push(['validation VM problem', 'validation pipeline internal error']);
		else if (body.includes('Template: msftbot/validationError/manifest'))
			findings.push(['needs fix', body.match(/Template: (\S+)/)![1]!]);
		else if (user.login.startsWith('wingetvalidator'))
			findings.push(['manual review', body.split('\n').filter(Boolean).join(' ')]);
		else if (user.type === 'User' && user.login !== author && !/\(Deterministic automation|^@wingetbot run/.test(body))
			reviews.push(['needs fix', `${user.login}: ${body.split('\n').find(Boolean)}`]);
	}
	findings.push(...reviews);
	// Tom: Manifest-Metadata-Consistency alone is usually fine, so only a reviewer's comment needs us there.
	if (!labels.some(({ name }) => name === 'Needs-Author-Feedback')) {
		if (!reviews.length) continue;
		findings.splice(0, findings.length, ...reviews);
	}
	if (!findings.length) findings.push(['needs fix', `no failure in ${zips ? 'results' : 'comments'}${comments.length ? '' : ', comments unreadable'}`]);

	const verdict = VERDICTS.find((v) => findings.some(([f]) => f === v))!;
	// Tom: a Defender scan that didn't start needs nothing from us.
	if (verdict === 'validation VM problem') continue;
	const details = [...new Set(findings.map(([, detail]) => detail))].join(' | ').replace(/\s+/g, ' ');
	const pkg = title.replace(/^(New|Update|Remove) version: (\S+) version (\S+).*$/, '$2 $3');
	const names = labels.map(({ name }) => name).join(',');
	console.log(`https://github.com/microsoft/winget-pkgs/pull/${number}\t${pkg}\t${names}\t${verdict}\t${details}`);
}
