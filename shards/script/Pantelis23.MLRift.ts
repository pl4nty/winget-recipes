import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the tag's leading "v" in PackageVersion (v1.1.0), which JSON
// shards always strip, so the raw tag is used as the version.
export default defineShard(async () => {
	const owner = 'Heniokhos-Systems';
	const repo = 'MLRift';
	const { rawTag } = await getLatestRelease({ owner, repo });
	const base = `https://github.com/${owner}/${repo}/releases/download/${rawTag}`;

	return {
		version: rawTag,
		urls: () => [`${base}/mlrc-windows-x86_64.zip`, `${base}/mlrc-windows-arm64.zip`],
		releaseNotes: { source: 'github', owner, repo, tag: rawTag },
	};
});
