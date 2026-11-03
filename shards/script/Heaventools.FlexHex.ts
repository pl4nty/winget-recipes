import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// download/flexhexsetup.exe redirects to the current installer under a
// per-release path. The installer is unversioned, so its ETag is the state and
// komac reads the version from the file's ProductVersion. The newest Version History entry is
// passed to the html release-notes source as a data: URL.
const download = 'https://www.heaventools.com/download/flexhexsetup.exe';
const history = 'https://www.heaventools.com/flexhex-version-history.htm';

export default defineShard(async () => {
	const response = await fetch(download, { method: 'HEAD' });
	const state = response.headers.get('etag');
	if (!response.ok || !state) {
		throw new Error(`No ETag for ${download} (HTTP ${response.status})`);
	}
	const url = response.url;

	const html = await fetch(history).then((page) => page.text());
	const {
		groups: [entry],
	} = match(html, /(<p><b>Version \d[\s\S]*?)(?=<p><b>Version \d)/);

	return {
		version: { source: 'product' },
		urls: () => [{ url, architecture: 'x64' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: history,
			cleanup: false,
		},
		state,
		replace: true,
	};
});
