import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// NirSoft download URLs are unversioned, so read the version from the product
// page's Versions History. Its newest entry becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.nirsoft.net/utils/wireless_network_watcher.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
		captures: { version },
	} = match(html, /Versions History<\/h4>\s*<ul[^>]*>\s*(<li>Version (?<version>\d+(?:\.\d+)+)[\s\S]*?)(?=<li>Version |<\/ul>\s*<\/ul>)/);

	return {
		version,
		urls: () => [
			'https://www.nirsoft.net/utils/wnetwatcher_setup.exe',
			{ url: 'https://www.nirsoft.net/utils/wnetwatcher.zip', architecture: 'x86' },
			'https://www.nirsoft.net/utils/wnetwatcher-x64.zip',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<ul>${entry}</ul>`)}`,
			releaseNotesUrl: `${page}#:~:text=Versions%20History`,
			cleanup: false,
		},
		replace: true,
	};
});
