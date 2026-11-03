import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the versioned installers (x64 and arm64). The file
// names are taken from the page because Wing 12 renamed them (wingpro-<v>.exe
// became wing-<v>.exe). CHANGELOG.txt holds every release, so only its newest
// section is passed on as the release notes.
const base = 'https://wingware.com/pub/wingpro';

export default defineShard(async () => {
	const page = await fetch('https://wingware.com/downloads/wingpro').then((response) => response.text());
	const {
		captures: { version, name },
	} = match(page, /pub\/wingpro\/(?<version>\d+(?:\.\d+)+)\/(?<name>wing(?:pro)?-\k<version>)\.exe/);
	const arm64 = match(page, /pub\/wingpro\/(?<version>\d+(?:\.\d+)+)\/(?<name>wing(?:pro)?-\k<version>-arm64)\.exe/);

	const releaseNotesUrl = `${base}/${version}/CHANGELOG.txt`;
	const changelog = await fetch(releaseNotesUrl).then((response) => response.text());
	const latest = changelog.split(/\n(?=Release \d)/)[0].trim();

	return {
		version,
		urls: () => [
			{ url: `${base}/${version}/${name}.exe`, architecture: 'x64' },
			{ url: `${base}/${arm64.captures.version}/${arm64.captures.name}.exe`, architecture: 'arm64' },
		],
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: `data:text/plain,${encodeURIComponent(latest)}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
