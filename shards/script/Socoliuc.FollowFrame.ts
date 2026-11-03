import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The updates page names the current release and keeps a one-line entry per
// version under Release history. That entry becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://followframe.com/updates/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /<h2>Current release<\/h2>\s*<p>Version <strong>(?<version>\d+(?:\.\d+)+)<\/strong>/);
	const {
		groups: [entry],
	} = match(html, new RegExp(`Release history</h2>[\\s\\S]*?<p>${version.replaceAll('.', '\\.')}\\s*(?:—|-)\\s*([\\s\\S]*?)</p>`));

	return {
		version,
		urls: () => [`https://followframe.com/downloads/FollowFrame-Single-Exe-${version}-win32-x64.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<p>${entry}</p>`)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
