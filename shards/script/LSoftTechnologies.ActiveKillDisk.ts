import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned and the history page only names the major
// version (KillDisk v.26), so komac reads the version from the installer and
// the ETag tells when it changed. The newest history row becomes the release
// notes: it is passed to the html source as a data: URL so the rest of the page
// is left out.
const url = 'https://download2.lsoft.net/KillDisk-Freeware-Setup.exe';
const page = 'https://www.killdisk.com/history.htm';

export default defineShard(async () => {
	const state = (await fetch(url, { method: 'HEAD' })).headers.get('etag');
	if (!state) throw new Error('No ETag header found');

	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [notes],
	} = match(html, /id="responsive-example-table"[\s\S]*?(<ul class="history">[\s\S]*?<\/ul>)/);

	return {
		version: { source: 'product' },
		urls: () => [{ url, architecture: 'x86' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#responsive-example-table`,
			cleanup: false,
		},
		state,
		replace: true,
	};
});
