import { glob, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { $ } from 'bun';
import { Database } from 'bun:sqlite';

// `bun package-requests.ts [YYYY-MM-DD | '*'] [mapping.tsv]` maps winget-pkgs Package Requests (created on or after
// the date, default 30 days ago, `*` for all) to PackageIdentifiers that now exist in winget-pkgs, and lists the ones
// nothing here covers yet: no shard on main, no shard PR or branch, no maintainers.csv row. A request maps through, in
// order: a manual `<issue>\t<PackageIdentifier>` row in mapping.tsv, the merged PR that closed it, an Id in its body
// or title, a GitHub `owner/repo` in its URLs, then its Package Name and Publisher. Prints
// `<PackageIdentifier>\t<latest request date>\t<request numbers>` to stdout, newest first, and writes every request
// with how it mapped (or `-` when it didn't) to package-requests.tsv.
const since = process.argv[2] ?? new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
// A manual row may list several Ids separated by `,` or `;` when one request covers several packages.
const manual = new Map<number, string[]>();
if (process.argv[3])
	for (const line of (await readFile(process.argv[3], 'utf8')).split('\n')) {
		const [number, ids] = line.trim().split('\t');
		if (number && ids && /^\d+$/.test(number)) manual.set(Number(number), ids.split(/[,;]\s*/).filter(Boolean));
	}
const repo = process.env.GITHUB_REPOSITORY ?? 'pl4nty/winget-recipes';

// The winget source index has every PackageIdentifier with its manifest casing, name and publisher.
const dir = await mkdtemp(join(tmpdir(), 'package-requests-'));
await $`curl -fsSLo ${dir}/source.msix https://cdn.winget.microsoft.com/cache/source2.msix`;
await $`unzip -q ${dir}/source.msix Public/index.db -d ${dir}`;
const db = new Database(join(dir, 'Public/index.db'), { readonly: true });
const rows = db.query<{ id: string; name: string }, []>('SELECT id, name FROM packages').all();
const packages = new Map(rows.map(({ id }) => [id.toLowerCase(), id]));
const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');
const byName = new Map<string, string[]>();
for (const { id, name } of rows) byName.set(norm(name), [...(byName.get(norm(name)) ?? []), id]);
db.close();
await rm(dir, { recursive: true, force: true });

type Issue = {
	number: number;
	title: string;
	body: string;
	createdAt: string;
	closedByPullRequestsReferences: { nodes: { merged: boolean; files: { nodes: { path: string }[] } | null }[] };
};
const issues = new Map<number, Issue>();
const query = `query($q: String!, $after: String) { search(query: $q, type: ISSUE, first: 100, after: $after) {
	pageInfo { hasNextPage endCursor }
	nodes { ... on Issue { number title body createdAt
		closedByPullRequestsReferences(first: 5, includeClosedPrs: false) { nodes { merged files(first: 20) { nodes { path } } } } } } } }`;
// Search returns at most 1000 results per query, so page back through creation dates.
for (const filter of ['label:Package-Request', '"[Package Request]" in:title'])
	for (let before = '', seen = new Set<number>(); ; ) {
		let added = 0;
		let oldest = '';
		for (let after: string | undefined; ; ) {
			const q = `repo:microsoft/winget-pkgs is:issue ${filter} created:${since}..${before || '*'} sort:created-desc`;
			const args = after ? ['-f', `after=${after}`] : [];
			const { data } = await $`gh api graphql -f query=${query} -f q=${q} ${args}`.json();
			for (const issue of data.search.nodes as Issue[]) {
				if (!issue.number || seen.has(issue.number)) continue;
				seen.add(issue.number);
				issues.set(issue.number, issue);
				if (!oldest || issue.createdAt < oldest) oldest = issue.createdAt;
				added++;
			}
			if (!data.search.pageInfo.hasNextPage) break;
			after = data.search.pageInfo.endCursor;
		}
		if (!added || !oldest || oldest === before) break;
		before = oldest;
	}

const tokens = (text: string) => text.match(/[A-Za-z0-9][\w+-]*(?:\.[\w+-]+)+/g) ?? [];
const field = (body: string, name: string) =>
	body.match(new RegExp(`^\\s*(?:#+\\s*)?${name}\\s*:?\\s*(.+)$`, 'im'))?.[1]?.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim() ?? '';
const find = (issue: Issue): [string[], string] | undefined => {
	const body = issue.body ?? '';
	const listed = (manual.get(issue.number) ?? []).map((id) => packages.get(id.toLowerCase())).filter(Boolean) as string[];
	if (listed.length) return [listed, 'manual'];
	for (const pr of issue.closedByPullRequestsReferences?.nodes ?? []) {
		if (!pr.merged) continue;
		const path = pr.files?.nodes.map(({ path }) => path).find((path) => path.startsWith('manifests/') && path.endsWith('.yaml'));
		const id = path && packages.get(basename(path).replace(/(\.installer|\.locale\.[^.]+)?\.yaml$/, '').toLowerCase());
		if (id) return [[id], 'pr'];
	}
	const token = [issue.title, body]
		.flatMap(tokens)
		.map((token) => packages.get(token.replace(/\.+$/, '').toLowerCase()))
		.find(Boolean);
	if (token) return [[token], 'id'];
	for (const [, owner, name] of body.matchAll(/github\.com\/([\w.-]+)\/([\w.-]+)/g)) {
		const id = packages.get(`${owner}.${name!.replace(/\.git$/, '')}`.toLowerCase());
		if (id) return [[id], 'github'];
	}
	const name = field(body, 'Package Name') || issue.title.replace(/^\[Package Request\]\s*:?\s*/i, '');
	const publisher = norm(field(body, 'Publisher'));
	const candidates = byName.get(norm(name)) ?? [];
	const match = candidates.length === 1 ? candidates[0] : candidates.find((id) => publisher && norm(id.split('.')[0]!) === publisher);
	if (match) return [[match], 'name'];
};

const requests = new Map<string, Issue[]>();
const report: string[] = ['issue\tcreated\tPackageIdentifier\thow\ttitle'];
let unmapped = 0;
for (const issue of [...issues.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
	const [ids, how] = find(issue) ?? [[], '-'];
	if (!ids.length) unmapped++;
	report.push(`${issue.number}\t${issue.createdAt.slice(0, 10)}\t${ids.join(',') || '-'}\t${how}\t${issue.title.replace(/\s+/g, ' ')}`);
	for (const id of ids) requests.set(id, [...(requests.get(id) ?? []), issue]);
}
await writeFile('package-requests.tsv', report.join('\n') + '\n');

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
const uncovered = [...requests]
	.filter(
		([id]) =>
			!covered.has(id.toLowerCase()) &&
			!wildcards.some((prefix) => `${id.toLowerCase()}.`.startsWith(prefix)) &&
			!branches.has(id.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
	)
	.map(([id, list]) => ({
		id,
		latest: list[0]!.createdAt.slice(0, 10),
		numbers: list.map((issue) => issue.number).join(' '),
	}))
	.sort((a, b) => b.latest.localeCompare(a.latest) || a.id.localeCompare(b.id));
for (const { id, latest, numbers } of uncovered) console.log(`${id}\t${latest}\t${numbers}`);
console.error(`${issues.size} Package Requests, ${unmapped} unmapped, ${requests.size} packages, ${uncovered.length} not covered`);
