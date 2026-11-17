import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Nightly releases are tagged nightly_<commit> and titled with their build time
// ("2026-11-16 07:11:21 UTC"); upstream versions are that date as YYYY.MM.DD.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'opentoonz', repo: 'opentoonz_nightlies', kind: 'prerelease' });
	const {
		captures: { year, month, day },
	} = match(release.title, /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) /, 'No dated OpenToonz nightly release found');

	return {
		version: `${year}.${month}.${day}`,
		// The Inno bootstrapper is 32-bit, but its payload (OpenToonz.exe and the tools) is AMD64 only.
		urls: () => [
			{
				url: `https://github.com/opentoonz/opentoonz_nightlies/releases/download/${release.rawTag}/OpenToonzSetup.exe`,
				architecture: 'x64',
			},
		],
		// Nightly releases have no body, so link the release page.
		releaseNotes: { releaseNotesUrl: `https://github.com/opentoonz/opentoonz_nightlies/releases/tag/${release.rawTag}` },
	};
});
