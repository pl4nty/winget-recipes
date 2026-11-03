import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the current installer and lists its release notes.
// The "Updates in <version>" list becomes the release notes: it is passed to
// the html source as a data: URL so the rest of the page is left out.
const page = 'https://quadspinner.com/Download';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /get\.gaea\.app\/Release\/Gaea-(?<version>\d+(?:\.\d+)+)\.exe/);
	const {
		captures: { entry },
	} = match(html, new RegExp(`<h1>Updates in ${version.replaceAll('.', '\\.')}</h1>\\s*(?<entry><ul>[\\s\\S]*?</ul>)`));

	return {
		version,
		urls: () => [`https://get.gaea.app/Release/Gaea-${version}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${page}#changelog`,
			cleanup: false,
		},
	};
});
