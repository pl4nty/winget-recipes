import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import { getLatestRelease } from 'anthelion/github';

// The repo also releases wppm (no installers), and each WinPython release ships one
// dot build per Python line, so take the newest Python's WinPython64-<python>dot.exe.
// Release tags vary in form (2026-04, 17.4.20260511final, 17.12.20260522/WinPython).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'winpython', repo: 'winpython', tagRegex: '^(?!wppm)', perPage: 50 });
	const builds = release
		.urls()
		.map((url) => ({ url, python: /\/WinPython64-(\d+(?:\.\d+)+)dot\.exe$/i.exec(url)?.[1] }))
		.filter((build): build is { url: string; python: string } => build.python !== undefined)
		.sort((a, b) => compareVersions(a.python, b.python));
	const build = builds.at(-1);
	if (!build) throw new Error(`No dot build in WinPython ${release.rawTag}`);

	return {
		version: release.rawTag.replace(/\/.*$/, ''),
		urls: () => [build.url],
		releaseNotes: { source: 'github', owner: 'winpython', repo: 'winpython', tag: release.rawTag },
	};
});
