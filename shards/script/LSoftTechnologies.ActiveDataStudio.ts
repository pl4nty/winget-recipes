import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned, so read the version from the newest entry
// of the Data Studio version history. Its notes become the release notes: they
// are passed to the html source as a data: URL so the rest of the page is left
// out.
const page = 'https://www.disktools.com/history/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [, notes],
		captures: { version },
	} = match(html, /<strong>Version (?<version>\d+(?:\.\d+)+)<\/strong>[\s\S]*?<div class="notes">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="version">|<\/section>)/);

	return {
		version,
		urls: () => [{ url: 'https://software.lsoft.net/ActiveDataStudioSetup.exe', architecture: 'x86' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes.replace(/<div class="release-badge[^"]*"><strong>[^<]*<\/strong><\/div>/g, ""))}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
