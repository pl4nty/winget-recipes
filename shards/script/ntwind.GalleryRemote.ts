import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page links the current Windows x64 setup. The matching entry of
// the What's New page becomes the release notes; it is passed to the html
// source as a data: URL so the rest of the page is left out.
const page = 'https://www.ntwind.com/remote/gallery.html';
const releaseNotesUrl = 'https://www.ntwind.com/remote/gallery/what-is-new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /\/download\/GalleryRemote_(?<version>\d+(?:\.\d+)+)-win-x64\.exe/);

	const notes = await fetch(releaseNotesUrl)
		.then((response) => (response.ok ? response.text() : ''))
		.catch(() => '');
	const escaped = version.replaceAll('.', '\\.');
	const entry = new RegExp(`<h2><a [^>]*>Gallery Remote v${escaped} [\\s\\S]*?(<ul>[\\s\\S]*?</ul>)`).exec(notes)?.[1];

	return {
		version,
		urls: () => [`https://www.ntwind.com/files/GalleryRemote_${version}-win-x64.exe`],
		releaseNotes: entry
			? { source: 'html', sourceUrl: `data:text/html,${encodeURIComponent(entry)}`, releaseNotesUrl, cleanup: false }
			: { releaseNotesUrl },
	};
});
