import { $ } from 'bun';

import { compareVersions } from './versions.ts';

// `bun close-superseded.ts [--close]` lists our open winget-pkgs PRs where the same or a newer version was merged
// after the PR was created; --close closes them.
const repo = 'microsoft/winget-pkgs';
type PR = { number: number; title: string; created_at: string; pull_request: { merged_at: string | null } };
const search = async (q: string): Promise<PR[]> =>
	(await $`gh api -X GET search/issues -f q=${`repo:${repo} is:pr ${q}`} -f per_page=100`.json()).items;
const parse = (title: string) => /^(?:New|Update) version: (\S+) version (\S+)/.exec(title)?.slice(1) ?? [];

for (const pr of await search('is:open author:@me')) {
	const [id, version] = parse(pr.title);
	if (!id || !version) continue;
	const merged = (await search(`is:merged merged:>${pr.created_at} in:title ${id}`)).find((other) => {
		const [otherId, otherVersion] = parse(other.title);
		return (
			otherId?.toLowerCase() === id.toLowerCase() &&
			other.pull_request.merged_at! > pr.created_at &&
			compareVersions(otherVersion!, version) >= 0
		);
	});
	if (merged && process.argv.includes('--close')) await $`gh pr close ${pr.number} -R ${repo}`.quiet();
	if (merged) console.log(`#${pr.number}\t${pr.title}\t#${merged.number}\t${merged.title}`);
	await Bun.sleep(2100); // 30 searches per minute
}
