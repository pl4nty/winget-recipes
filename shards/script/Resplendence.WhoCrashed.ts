import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The setup URL is unversioned, so read the version from the "What's new" page.
// Its newest section becomes the release notes: it is passed to the html source
// as a data: URL so the older versions on the page are left out.
const page = 'https://www.resplendence.com/whocrashed_whatsnew.htm';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [, entry],
		captures: { version },
	} = match(
		html,
		/changes have been made to WhoCrashed (?<version>\d+(?:\.\d+)+) since last version(?:<br>\s*)*<\/font>\s*<\/p>([\s\S]*?)<hr>/i,
	);

	return {
		version,
		urls: () => [{ url: 'https://www.resplendence.com/download/whocrashedSetup.exe', architecture: 'neutral' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry!)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
