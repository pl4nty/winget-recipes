import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// The repository also releases other apps, so the newest release carrying the UI-TARS setup is picked by version.
// The NSIS/Squirrel stub is x86, but the installed UI-TARS.exe is x64.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'bytedance',
		repo: 'UI-TARS-desktop',
		sortByVersion: true,
		perPage: 100,
		assetRegex: '^UI-TARS-\\d+(?:\\.\\d+)+-Setup\\.exe$',
	});

	return {
		version: release.version,
		urls: () => release.urls().map((url) => ({ url, architecture: 'x64' as const })),
		releaseNotes: { source: 'github', owner: 'bytedance', repo: 'UI-TARS-desktop', tag: release.rawTag },
	};
});
