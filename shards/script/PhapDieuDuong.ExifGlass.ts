import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Tags are major.minor.patch.build (3.0.0.1105), but the MSIX version is major.minor.build.patch (3.0.1105.0).
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'd2phap', repo: 'ExifGlass' });
	const [major, minor, patch, build] = rawTag.split('.');
	const base = `https://github.com/d2phap/ExifGlass/releases/download/${rawTag}/ExifGlass_${rawTag}`;

	return {
		version: `${major}.${minor}.${build}.${patch}`,
		urls: () => [`${base}_win-x64.msix`, `${base}_win-x64.zip`, `${base}_win-arm64.msix`, `${base}_win-arm64.zip`],
		releaseNotes: { source: 'github', owner: 'd2phap', repo: 'ExifGlass', tag: rawTag },
	};
});
