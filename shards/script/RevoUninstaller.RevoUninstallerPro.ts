import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The version history lists each release with its versioned CDN setup link.
// Its newest entry gives the version, the installer URL and the release notes,
// which are passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.revouninstaller.com/revo-uninstaller-pro-full-version-history/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { url, version, notes },
	} = match(
		html,
		/<article class="version">[\s\S]*?href="(?<url>https:\/\/[^"]+\/RevoUninProSetup\.exe)">\s*Version (?<version>\d+(?:\.\d+)+)[\s\S]*?(?<notes><ul class="dlist">[\s\S]*?<\/ul>)/,
	);

	return {
		version: version.split('.').length < 4 ? `${version}.0` : version,
		urls: () => [url],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
