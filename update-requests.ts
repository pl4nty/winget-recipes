import { glob, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { $ } from 'bun';
import { Database } from 'bun:sqlite';

// `bun update-requests.ts [YYYY-MM-DD | '*']` lists packages with winget-pkgs Update Requests (created on or after
// the date, default 30 days ago, `*` for all) that nothing here covers yet: no shard on main, no shard PR or branch,
// no maintainers.csv row. Prints `<PackageIdentifier>\t<latest request date>\t<request numbers>`, newest first.
const since = process.argv[2] ?? new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
const repo = process.env.GITHUB_REPOSITORY ?? 'pl4nty/winget-recipes';

// The winget source index has every PackageIdentifier with its manifest casing.
const dir = await mkdtemp(join(tmpdir(), 'update-requests-'));
await $`curl -fsSLo ${dir}/source.msix https://cdn.winget.microsoft.com/cache/source2.msix`;
await $`unzip -q ${dir}/source.msix Public/index.db -d ${dir}`;
const db = new Database(join(dir, 'Public/index.db'), { readonly: true });
const packages = new Map(
	db
		.query<{ id: string }, []>('SELECT id FROM packages')
		.all()
		.map(({ id }) => [id.toLowerCase(), id]),
);

type Issue = { number: number; title: string; body: string | null; created_at: string };
const issues = new Map<number, Issue>();
// Search returns at most 1000 results per query, so page back through creation dates.
for (let before = ''; ; ) {
	let added = 0;
	for (let page = 1; page <= 10; page++) {
		const q = `repo:microsoft/winget-pkgs is:issue label:Package-Update created:${since}..${before || '*'}`;
		const { items }: { items: Issue[] } =
			await $`gh api -X GET search/issues -f q=${q} -f sort=created -f order=desc -f per_page=100 -f page=${page}`.json();
		for (const issue of items) {
			if (issues.has(issue.number)) continue;
			issues.set(issue.number, issue);
			added++;
		}
		await Bun.sleep(2100); // 30 searches per minute
		if (items.length < 100) break;
	}
	const oldest = [...issues.values()].at(-1)?.created_at;
	if (!added || !oldest || oldest === before) break;
	before = oldest;
}

const section = (body: string, heading: string) =>
	body.match(new RegExp(`### ${heading}[^\\n]*\\n+([\\s\\S]*?)(?=\\n### |$)`))?.[1] ?? '';
const tokens = (text: string) => text.match(/[A-Za-z0-9][\w+-]*(?:\.[\w+-]+)+/g) ?? [];
const requests = new Map<string, Issue[]>();
for (const issue of issues.values()) {
	const body = issue.body ?? '';
	const id = [section(body, 'Current Package Identifier'), issue.title, body]
		.flatMap(tokens)
		.map((token) => packages.get(token.replace(/\.+$/, '').toLowerCase()))
		.find(Boolean);
	if (id) requests.set(id, [...(requests.get(id) ?? []), issue]);
}

const covered = new Set<string>();
for await (const shard of glob('shards/{json,script}/*.{json,ts}'))
	covered.add(basename(shard).replace(/\.(json|ts)$/, '').toLowerCase());
for (const row of (await readFile('maintainers.csv', 'utf8')).trim().split('\n').slice(1))
	covered.add(row.split(',')[0]!.toLowerCase());
// Open, merged and closed shard PRs all count: a closed one is a decision. Ten pages at a time.
for (let first = 1, last = false; !last; first += 10) {
	const pages = await Promise.all(
		Array.from({ length: 10 }, async (_, i) =>
			(await $`gh api ${`repos/${repo}/pulls?state=all&per_page=100&page=${first + i}`} --jq .[].title`.text())
				.split('\n')
				.filter(Boolean),
		),
	);
	for (const title of pages.flat()) {
		const id = title.match(/^feat: add (\S+) shard$/)?.[1];
		if (id) covered.add(id.toLowerCase());
	}
	last = pages.some((titles) => titles.length < 100);
}
// Branches pushed without a PR yet (PR Queue backlog, held drafts) are named `<prefix>-<id with dashes>`.
const branches = new Set(
	(await $`git ls-remote --heads origin`.text())
		.split('\n')
		.map((line) => line.replace(/^.*refs\/heads\/claude\/project-thread-[a-z0-9]+-/, '')),
);

const wildcards = [...covered].filter((id) => id.endsWith('.*')).map((id) => id.slice(0, -1));
const rows = [...requests]
	.filter(
		([id]) =>
			!covered.has(id.toLowerCase()) &&
			!wildcards.some((prefix) => `${id.toLowerCase()}.`.startsWith(prefix)) &&
			!branches.has(id.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
	)
	.map(([id, list]) => ({
		id,
		latest: list[0]!.created_at.slice(0, 10),
		numbers: list.map((issue) => issue.number).join(' '),
	}))
	.sort((a, b) => b.latest.localeCompare(a.latest) || a.id.localeCompare(b.id));
for (const { id, latest, numbers } of rows) console.log(`${id}\t${latest}\t${numbers}`);
console.error(`${issues.size} Update Requests, ${requests.size} packages, ${rows.length} not covered`);
