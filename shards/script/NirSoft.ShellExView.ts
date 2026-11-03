import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// NirSoft download URLs are unversioned, so read the version from the product
// page's Versions History table. Its newest row becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.nirsoft.net/utils/shexview.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, notes },
	} = match(
		html,
		/Versions History<\/h4>\s*<table[^>]*>\s*<tr class="utiltableheader">.*\s*<tr><td>[^<]*<td>\s*(?<version>\d+(?:\.\d+)+)\s*<td>(?<notes>[\s\S]*?)(?=<tr>|<\/table>)/,
	);

	return {
		version,
		urls: () => [
			'https://www.nirsoft.net/utils/shexview_setup.exe',
			{ url: 'https://www.nirsoft.net/utils/shexview.zip', architecture: 'x86' },
			'https://www.nirsoft.net/utils/shexview-x64.zip',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<ul><li>Version ${version}:${notes}</li></ul>`)}`,
			releaseNotesUrl: `${page}#:~:text=Versions%20History`,
			cleanup: false,
		},
		replace: true,
	};
});
