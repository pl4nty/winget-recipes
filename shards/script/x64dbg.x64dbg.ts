import { defineShard } from 'anthelion';

type Release = {
	tag_name: string;
	prerelease: boolean;
	draft: boolean;
	assets: { name: string; browser_download_url: string }[];
};

// Dated releases (e.g. 2026.05.27) ship one snapshot_<date>_<time>.zip holding both the
// x32 and x64 builds; the time part is not predictable, so read it from the release assets.
export default defineShard(async () => {
	const response = await fetch('https://api.github.com/repos/x64dbg/x64dbg/releases?per_page=30', {
		headers: {
			Accept: 'application/vnd.github+json',
			...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
		},
	});
	if (!response.ok) throw new Error(`Failed to list x64dbg releases: ${response.status}`);

	const releases = (await response.json()) as Release[];
	const release = releases.find(
		(r) => !r.draft && !r.prerelease && /^\d{4}\.\d{2}\.\d{2}$/.test(r.tag_name),
	);
	if (!release) throw new Error('No dated x64dbg release found');
	const asset = release.assets.find((a) => /^snapshot_[\d_-]+\.zip$/.test(a.name));
	if (!asset) throw new Error(`x64dbg ${release.tag_name} has no snapshot zip`);

	return {
		version: release.tag_name,
		urls: () => [
			{ url: asset.browser_download_url, architecture: 'x86' },
			{ url: asset.browser_download_url, architecture: 'x64' },
		],
		releaseNotes: { source: 'github', owner: 'x64dbg', repo: 'x64dbg', tag: release.tag_name },
	};
});
