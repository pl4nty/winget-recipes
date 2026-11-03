import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// NirSoft download URLs are unversioned, so read the version from the product
// page's Versions History. Its newest entry becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.nirsoft.net/utils/zipinst.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
		captures: { version },
	} = match(html, /Versions History<\/h4>\s*<table[^>]*>\s*<tr class="utiltableheader">[^\n]*\n\s*(<tr><td>[^<]*<td>(?<version>\d+(?:\.\d+)+)<td>[\s\S]*?)(?=<tr>|<\/table>)/);

	return {
		version,
		urls: () => [
			{ url: 'https://www.nirsoft.net/utils/zipinst.zip', architecture: 'x86' },
			{ url: 'https://www.nirsoft.net/utils/zipinst.exe', architecture: 'x86' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<table>${entry}</table>`)}`,
			releaseNotesUrl: `${page}#:~:text=Versions%20History`,
			cleanup: false,
		},
		replace: true,
	};
});
