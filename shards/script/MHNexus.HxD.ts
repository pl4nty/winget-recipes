import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// HxDSetup.zip is unversioned, so read the newest entry of the vendor change
// log. The vendor writes 2.5.0.0 while the package uses 2.5, so trailing .0
// parts are dropped. Only that entry's changes become the release notes: they
// are passed to the html source as a data: URL so the rest of the page is left out.
const changelog = 'https://mh-nexus.de/en/hxd/changelog.php';

export default defineShard(async () => {
	const html = await fetch(changelog).then((response) => response.text());
	const {
		groups: [fullVersion, entry],
	} = match(html, /id="v_(\d+(?:\.\d+)+)"[^>]*>[^<]*<\/td>(?:\s*<!--[\s\S]*?-->)?\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/);
	const version = fullVersion.replace(/(?:\.0)+$/, '');

	return {
		version,
		urls: () => ['https://mh-nexus.de/downloads/HxDSetup.zip'],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
		replace: true,
	};
});
