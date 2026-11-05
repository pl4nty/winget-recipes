import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the versioned installer. CHANGELOG.txt holds every
// release, so only its newest section is passed on as the release notes.
const base = 'https://wingware.com/pub/wing-personal';

export default defineShard(async () => {
	const page = await fetch('https://wingware.com/downloads/wing-personal').then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /pub\/wing-personal\/(?<version>\d+(?:\.\d+)+)\/wing-personal-\k<version>\.exe/);

	const releaseNotesUrl = `${base}/${version}/CHANGELOG.txt`;
	const changelog = await fetch(releaseNotesUrl).then((response) => response.text());
	const latest = changelog.split(/\n(?=Release \d)/)[0].trim();

	return {
		version,
		urls: () => [{ url: `${base}/${version}/wing-personal-${version}.exe`, architecture: 'x64' }],
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: `data:text/plain,${encodeURIComponent(latest)}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
