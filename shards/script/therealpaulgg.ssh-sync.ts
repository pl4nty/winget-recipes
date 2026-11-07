import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream PackageVersion keeps the tag's leading "v" (e.g. v1.4.3), which
// JSON shards strip, so use the raw tag as the version.
const owner = 'therealpaulgg';
const repo = 'ssh-sync';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner, repo });
	const base = `https://github.com/${owner}/${repo}/releases/download/${release.rawTag}`;

	return {
		version: release.rawTag,
		urls: () => [`${base}/ssh-sync-setup-amd64.exe`, `${base}/ssh-sync-setup-arm64.exe`],
		releaseNotes: { source: 'github', owner, repo, tag: release.rawTag },
	};
});
