import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are dates (20251009) but the Windows installer is named FontForge-2025-10-09-Windows-x64.exe,
// so take the installer straight from the release assets.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'fontforge',
		repo: 'fontforge',
	});

	return {
		version: release.version,
		urls: () => release.urls().filter((url) => /\/FontForge-[\d-]+-Windows-[^/]+\.exe$/.test(url)),
		releaseNotes: {
			source: 'github',
			owner: 'fontforge',
			repo: 'fontforge',
			tag: release.rawTag,
		},
	};
});
