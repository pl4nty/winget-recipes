import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The DDU listing links each release to its own page, whose ChangeLog section
// becomes the release notes. It is passed to the html source as a data: URL so
// the rest of the page (donation links, Patreon list) is left out.
const listing = 'https://www.wagnardsoft.com/display-driver-uninstaller-ddu';

export default defineShard(async () => {
	const index = await fetch(listing).then((response) => response.text());
	const {
		captures: { path, version },
	} = match(index, /<a href="(?<path>\/content\/Download-Display-Driver-Uninstaller-DDU-\d+)">Download Display Driver Uninstaller \(DDU\) (?<version>\d+(?:\.\d+)+)</);

	const page = new URL(path, listing).href;
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [changelog],
	} = match(html, /<u>ChangeLog:<\/u><\/p>([\s\S]*?)<h3>Known issues:<\/h3>/);

	return {
		version,
		urls: () => [`https://download.wagnardsoft.com/DDU/DDU%20v${version}_setup.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(changelog)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
