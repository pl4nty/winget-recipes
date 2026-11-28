import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// DevToys 2 ships as GitHub prereleases tagged v<major>.<minor>.<n>.0 (the "latest" release is still DevToys 1.0.x),
// and upstream writes them as <major>.<minor>-preview.<n> (v2.0.9.0 -> 2.0-preview.9).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'DevToys-app', repo: 'DevToys', kind: 'prerelease', tagRegex: '^v\\d+\\.\\d+\\.\\d+\\.0$' });
	const parts = /^v(\d+)\.(\d+)\.(\d+)\.0$/.exec(release.rawTag);
	if (!parts) throw new Error(`Unexpected DevToys prerelease tag ${release.rawTag}`);
	const version = `${parts[1]}.${parts[2]}-preview.${parts[3]}`;
	const base = `https://github.com/DevToys-app/DevToys/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [`${base}/devtoys_win_x86.exe`, `${base}/devtoys_win_x64.exe`, `${base}/devtoys_win_arm64.exe`],
	};
});
