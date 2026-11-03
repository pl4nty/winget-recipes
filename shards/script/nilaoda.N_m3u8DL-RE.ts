import { defineShard } from 'anthelion';

type Release = { tag_name: string; draft: boolean; assets: { name: string; browser_download_url: string }[] };

// Every release is a prerelease (v0.6.0-beta) and asset names carry a build
// date (..._win-x64_20260629.zip), so take the newest release with a win-x64
// zip and pick its assets by architecture, keeping upstream's x64, arm64 order.
export default defineShard(async () => {
	const response = await fetch('https://api.github.com/repos/nilaoda/N_m3u8DL-RE/releases?per_page=20', {
		headers: {
			Accept: 'application/vnd.github+json',
			...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
		},
	});
	if (!response.ok) throw new Error(`Failed to list N_m3u8DL-RE releases: ${response.status}`);
	const releases = (await response.json()) as Release[];

	const asset = (release: Release, arch: string) =>
		release.assets.find((a) => new RegExp(`^N_m3u8DL-RE_.+_win-${arch}_\\d+\\.zip$`).test(a.name));
	const release = releases.find((r) => !r.draft && asset(r, 'x64'));
	if (!release) throw new Error('No N_m3u8DL-RE release has a win-x64 zip');

	const urls = ['x64', 'arm64', 'NT6\\.0-x86']
		.map((arch) => asset(release, arch)?.browser_download_url)
		.filter((url): url is string => Boolean(url));

	return {
		version: release.tag_name.replace(/^v/, ''),
		urls: () => urls,
		releaseNotes: {
			source: 'github',
			owner: 'nilaoda',
			repo: 'N_m3u8DL-RE',
			tag: release.tag_name,
		},
	};
});
