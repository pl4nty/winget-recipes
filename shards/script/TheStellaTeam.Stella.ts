import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Stella tags releases with the base version (7.0) but rebuilds can ship
// letter-suffixed assets (Stella-7.0c-x64.exe), so take the Windows zip and
// x64 installer straight from the release assets.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'stella-emu',
		repo: 'stella',
	});

	const assets = release.urls();
	const zip = assets.find((url) => /\/Stella-[\w.]+-windows\.zip$/.test(url));
	const exe = assets.find((url) => /\/Stella-[\w.]+-x64\.exe$/.test(url));
	if (!zip || !exe) throw new Error('Missing Stella Windows assets');

	return {
		version: release.version,
		urls: () => [zip, exe],
		releaseNotes: {
			source: 'github',
			owner: 'stella-emu',
			repo: 'stella',
			tag: release.rawTag,
		},
	};
});
