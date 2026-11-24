import { compareVersions } from './versions.ts';

// `bun close-superseded.ts [--close]` lists our open winget-pkgs PRs whose version, or a newer one, was merged
// after the PR was created. Prints `<PR>\t<id> <version>\t<merged version> <merged PR>\t<dry run|closed|error>`;
// --close closes them.
const close = process.argv.includes('--close');
const repo = 'microsoft/winget-pkgs';
const author = process.env.GITHUB_REPOSITORY_OWNER ?? 'pl4nty';

// On a rate limit, give up on this PR and leave it for the next run.
async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`https://api.github.com/${path}`, {
		...init,
		headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
	});
	if (!response.ok) {
		const limited =
			response.status === 429 ||
			response.headers.has('retry-after') ||
			response.headers.get('x-ratelimit-remaining') === '0';
		throw new Error(`${limited ? 'rate limited' : response.status} ${path}`);
	}
	return response.json() as Promise<T>;
}

type Commit = { commit: { message: string } };
const commits = (path: string, range: string) =>
	api<Commit[]>(`repos/${repo}/commits?path=${encodeURIComponent(path)}&${range}&per_page=1`);

const prs: { number: number; created_at: string }[] = [];
for (let page = 1; page <= 10; page++) {
	const q = `repo:${repo} is:pr is:open author:${author}`;
	const { items } = await api<{ items: typeof prs }>(`search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`);
	prs.push(...items);
	if (items.length < 100) break;
}

for (const { number, created_at } of prs) {
	try {
		const files = await api<{ filename: string }[]>(`repos/${repo}/pulls/${number}/files?per_page=100`);
		const dirs = [...new Set(files.map(({ filename }) => filename.split('/').slice(0, -1).join('/')))];
		if (dirs.length !== 1 || dirs[0]!.split('/').length < 4) continue;
		const pkg = dirs[0]!.split('/').slice(0, -1).join('/');
		const id = pkg.split('/').slice(2).join('.');
		const version = dirs[0]!.split('/').at(-1)!;

		if (!(await commits(pkg, `since=${created_at}`)).length) continue;
		const entries = await api<{ name: string; type: string }[]>(`repos/${repo}/contents/${pkg}`);
		const candidates = entries
			.filter(({ name, type }) => type === 'dir' && compareVersions(name, version) >= 0)
			.map(({ name }) => name)
			.sort(compareVersions)
			.reverse();
		for (const candidate of candidates) {
			const contents = await api<{ name: string }[]>(`repos/${repo}/contents/${pkg}/${candidate}`);
			if (!contents.some(({ name }) => name.toLowerCase() === `${id.toLowerCase()}.yaml`)) continue;
			if ((await commits(`${pkg}/${candidate}`, `until=${created_at}`)).length) continue;
			const [added] = await commits(`${pkg}/${candidate}`, `since=${created_at}`);
			if (!added) continue;
			const merged = added.commit.message.match(/\(#(\d+)\)/)?.[1];
			if (close) await api(`repos/${repo}/pulls/${number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
			console.log(`#${number}\t${id} ${version}\t${candidate} ${merged ? `#${merged}` : ''}\t${close ? 'closed' : 'dry run'}`);
			break;
		}
	} catch (error) {
		console.log(`#${number}\t\t\t${(error as Error).message}`);
	}
}
