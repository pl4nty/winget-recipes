import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned, so read the version from the vendor's
// versions history. Its newest entry becomes the release notes: it is passed to
// the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.enigmaprotector.com/en/downloads/changelogenigmavb.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, notes },
	} = match(
		html,
		/>(?<version>\d+\.\d+) Build \d+<\/a>\s*<div id="content0"[^>]*>(?<notes>[\s\S]*?)<\/div>/,
	);

	return {
		version,
		urls: () => [{ url: 'https://www.enigmaprotector.com/assets/files/enigmavb.exe', architecture: 'x86' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<p>${notes}</p>`)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
