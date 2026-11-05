import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the leading "v" in PackageVersion (v3.0.0), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Matro81',
		repo: '4K-Wallpaper-App',
	});

	return {
		version: release.rawTag,
		urls: () => release.urls().filter((url) => /\/4KWallpaperChanger[^/]*Setup[^/]*\.exe$/i.test(url)).map((url) => ({ url, architecture: 'x64' })),
		releaseNotes: { releaseNotesUrl: `https://github.com/Matro81/4K-Wallpaper-App/releases/tag/${release.rawTag}` },
	};
});
