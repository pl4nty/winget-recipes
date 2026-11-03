import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned, so its ETag tracks changes and the version comes from the
// installer's FileVersion (it has no ProductVersion). The history page's newest entry becomes the release notes: it is passed to the
// html source as a data: URL so the page's navigation and older entries are left out.
const url = 'https://multiping.com/downloads/mping_3.exe';
const page = 'https://multiping.com/history.html';

export default defineShard(async () => {
	const state = (await fetch(url, { method: 'HEAD' })).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
	} = match(html, /(<h4>MultiPing Version [\s\S]*?<\/ul>)/);

	return {
		version: { source: 'file' },
		urls: () => [url],
		state,
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
