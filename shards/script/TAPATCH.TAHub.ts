import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page's Changelog card marks the newest version "Latest". Its list
// becomes the release notes: it is passed to the html source as a data: URL so
// the rest of the page is left out.
const page = 'https://tapatch.com/tools/tahub/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [, notes],
		captures: { version },
	} = match(html, />Changelog<\/h2>[\s\S]*?>v(?<version>\d+(?:\.\d+)+) — Latest<\/p>\s*(<ul[^>]*>[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => [`https://tapatch.com/downloads/TAHub-Setup-${version}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
