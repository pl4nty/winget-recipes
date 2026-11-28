import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags have a fourth, always-zero part (0.1.10.0) that winget-pkgs leaves out (0.1.10).
export default defineShard(async () => {
	const { rawTag } = await getLatestRelease({ owner: 'ananthakumaran', repo: 'webify' });
	const parts = /^(\d+\.\d+\.\d+)\.0$/.exec(rawTag);
	if (!parts) throw new Error(`Unexpected webify release tag ${rawTag}`);

	return {
		version: parts[1]!,
		urls: () => [`https://github.com/ananthakumaran/webify/releases/download/${rawTag}/webify-windows-amd64.exe`],
		releaseNotes: { source: 'github', owner: 'ananthakumaran', repo: 'webify', tag: rawTag },
	};
});
