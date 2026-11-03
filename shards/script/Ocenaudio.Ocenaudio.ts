import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page lists the current Windows build's version. The changelog's
// entry for that version becomes the release notes, passed to the html source
// as a data: URL so the rest of the page is left out.
const changelog = 'https://www.ocenaudio.com/changelog';

export default defineShard(async () => {
	const download = await fetch('https://www.ocenaudio.com/download').then((response) => response.text());
	const {
		captures: { version },
	} = match(download, /ocenaudio_windows64\.exe<\/p>\s*<p>Version (?<version>\d+(?:\.\d+)+)<\/p>/);

	const notes = await fetch(changelog).then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		groups: [entry],
	} = match(notes, new RegExp(`>Version ${escaped}</a></p>\\s*(<ul>[\\s\\S]*?</ul>)`));

	return {
		version,
		urls: () => [`https://www.ocenaudio.com/downloads/index.php/ocenaudio_windows64.exe?version=v${version}`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
	};
});
