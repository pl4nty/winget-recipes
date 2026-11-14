import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'mcmilk', repo: '7-Zip-zstd' });
	// Tag v26.05-v1.5.7-R1 -> version 26.05-v1.5.7-R1; asset names use the 7-Zip part (26.05).
	const version = release.rawTag.replace(/^v/i, '');
	const sevenZip = version.split('-')[0];
	const base = `https://github.com/mcmilk/7-Zip-zstd/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => ['x86', 'x64', 'arm64'].map((arch) => `${base}/7z${sevenZip}-zstd-${arch}-ndm.exe`),
		releaseNotes: { source: 'github', owner: 'mcmilk', repo: '7-Zip-zstd', tag: release.rawTag },
	};
});
