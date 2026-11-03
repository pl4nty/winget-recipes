import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Sordum download URLs are unversioned, so read the version from the product
// page title. Its "What is New" section becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.sordum.org/9660/';
const zip = 'https://www.sordum.org/files/download/net-disabler/NetDisabler.zip';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /<title>Net Disabler\s+v(?<version>\d+(?:\.\d+)+)/);
	const {
		captures: { notes },
	} = match(html, /(?<notes><p><strong><span[^>]*>What is New[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>)/);

	return {
		version,
		urls: () => [
			{ url: zip, architecture: 'x86', nestedInstallerMatches: ['NetDisabler.exe'] },
			{ url: zip, architecture: 'x64', nestedInstallerMatches: ['NetDisabler_x64.exe'] },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#:~:text=What%20is%20New`,
			cleanup: false,
		},
		replace: true,
	};
});
