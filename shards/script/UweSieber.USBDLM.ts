import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// USBDLM download URLs are unversioned, so read the version from the product
// page's Latest History. Its newest entry becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.uwe-sieber.de/usbdlm_e.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, notes },
	} = match(html, /name="history"[\s\S]*?\sV(?<version>\d+(?:\.\d+)+) \([^)]*\)\s*(?<notes><UL>[\s\S]*?<\/UL>)/i);

	return {
		version: `${version}.0`,
		urls: () => ['https://www.uwe-sieber.de/files/usbdlm_Win32.msi', 'https://www.uwe-sieber.de/files/usbdlm_x64.msi'],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#history`,
			cleanup: false,
		},
		replace: true,
	};
});
