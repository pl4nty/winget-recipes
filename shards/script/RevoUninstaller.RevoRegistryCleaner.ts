import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The version history's newest entry gives the version and the release notes,
// which are passed to the html source as a data: URL so the rest of the page is
// left out. The product page links the versioned CDN setup for that release.
const page = 'https://www.revouninstaller.com/revo-registry-cleaner-free-version-history/';
const product = 'https://www.revouninstaller.com/products/revo-registry-cleaner-free/';

export default defineShard(async () => {
	const [history, download] = await Promise.all(
		[page, product].map((url) => fetch(url).then((response) => response.text())),
	);
	const {
		captures: { version, notes },
	} = match(
		history,
		/<article class="version">[\s\S]*?Version (?<version>\d+(?:\.\d+)+)\s*<\/span>[\s\S]*?(?<notes><ul class="dlist">[\s\S]*?<\/ul>)/,
	);
	const {
		captures: { url },
	} = match(download, new RegExp(`(?<url>https://[^"]+/rrc${version.replaceAll('.', '')}/RevoRegCleanerFreeSetup\\.exe)`));

	return {
		version,
		urls: () => [url],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
