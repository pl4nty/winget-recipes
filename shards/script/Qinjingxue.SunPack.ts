import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream versions keep the tag's leading v, which JSON shards strip.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'Qinjingxue', repo: 'Sunpack' });
	const base = `https://github.com/Qinjingxue/Sunpack/releases/download/${rawTag}`;

	return {
		version: rawTag,
		urls: () => [`${base}/sunpack-windows-x64-${rawTag}-setup.exe`, `${base}/sunpack-windows-arm64-${rawTag}-setup.exe`],
		releaseNotes: { source: 'github', owner: 'Qinjingxue', repo: 'Sunpack', tag: rawTag },
	};
});
