import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The electron-builder feed gives the version and the changelog page. The
// changelog page's article body becomes the release notes, passed to the html
// source as a data: URL so the page navigation is left out.
export default defineShard(async () => {
	const feed = await fetch('https://download.bomist.app/dist/windows/latest.yml').then((response) => response.text());
	const {
		captures: { version },
	} = match(feed, /^version:\s*(?<version>\d+(?:\.\d+)+)\s*$/m);
	const {
		captures: { notes },
	} = match(feed, /^releaseNotes:\s*(?<notes>https:\/\/docs\.bomist\.com\/\S+)\s*$/m);
	const html = await fetch(notes).then((response) => response.text());
	const {
		groups: [body],
	} = match(html, /<div id="__blog-post-container"[^>]*>([\s\S]*?)<\/div><\/article>/);

	return {
		version,
		urls: () => [`https://download.bomist.app/dist/windows/BOMIST+Setup+${version}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(body)}`,
			releaseNotesUrl: notes,
			cleanup: false,
		},
	};
});
