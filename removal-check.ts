import { $ } from 'bun';
for (const [repo, n] of [['microsoft/MIDI', 100], ['microsoft/tui-test', 5]] as const) {
	const releases = await $`gh api repos/${repo}/releases?per_page=${n}`.json();
	for (const r of releases)
		console.log(`## ${repo} ${r.tag_name} prerelease=${r.prerelease} ${r.published_at} ${r.name}\n${r.assets.map((a: any) => `  ${a.browser_download_url} ${a.size} ${a.digest ?? ''}`).join('\n')}`);
	console.log((await $`gh api repos/${repo}/releases/latest --jq .tag_name`.nothrow().text()).trim());
}
