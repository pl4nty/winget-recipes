import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags look like 2026.10.30-RELEASE; the package version is 2026-10-30 and the
// installer name carries a build stamp (doomtools-setup-jre-2026.10.30.234413298.exe).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'MTrop',
		repo: 'DoomTools',
		tagRegex: '-RELEASE$',
	});

	const {
		groups: [year, month, day],
	} = match(release.rawTag, /^(\d{4})\.(\d{2})\.(\d{2})-RELEASE$/);
	const version = `${year}-${month}-${day}`;

	const urls = () => release.urls().filter((url) => /\/doomtools-setup-jre-[\d.]+\.exe$/.test(url));

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'MTrop',
			repo: 'DoomTools',
			tag: release.rawTag,
		},
	};
});
