import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Sordum download URLs are unversioned, so read the version from the product
// page title. Its "What is new" section becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://www.sordum.org/7952/';
const zip = 'https://www.sordum.org/files/download/dns-jumper/DnsJumper.zip';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /<title>Dns Jumper\s+v(?<version>\d+(?:\.\d+)+)/);
	const {
		captures: { notes },
	} = match(html, /(?<notes><p><strong><span[^>]*>What is new[\s\S]*?<\/p>)/);

	return {
		version,
		urls: () => [{ url: zip, architecture: 'x86' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#:~:text=What%20is%20new`,
			cleanup: false,
		},
		replace: true,
	};
});
