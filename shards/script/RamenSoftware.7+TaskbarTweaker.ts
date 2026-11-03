import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download URL is unversioned, so read the version from the installer's
// changelog page. Its newest entry becomes the release notes: it is passed to
// the html source as a data: URL so older entries are left out.
const changelog = 'https://ramensoftware.com/downloads/7tt_setup.exe?changelog';

export default defineShard(async () => {
	const html = await fetch(changelog).then((response) => response.text());
	const {
		groups: [entry],
		captures: { version },
	} = match(html, /(<b>v(?<version>\d+(?:\.\d+)+) \([^)]*\)<\/b>\s*<ul>[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => ['https://ramensoftware.com/downloads/7tt_setup.exe'],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
	};
});
