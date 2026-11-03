import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page links the current setup, which carries both the 32-bit and
// 64-bit builds. The matching entry of the What's New page becomes the release
// notes; it is passed to the html source as a data: URL so the rest of the
// page is left out.
const page = 'https://www.ntwind.com/software/winsnap.html';
const releaseNotesUrl = 'https://www.ntwind.com/software/winsnap/what-is-new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /\/download\/WinSnap_(?<version>\d+(?:\.\d+)+)-setup\.exe/);
	const url = `https://www.ntwind.com/files/WinSnap_${version}-setup.exe`;

	const notes = await fetch(releaseNotesUrl)
		.then((response) => (response.ok ? response.text() : ''))
		.catch(() => '');
	const escaped = version.replaceAll('.', '\\.');
	const entry = new RegExp(`<h2><a [^>]*>WinSnap v${escaped} [\\s\\S]*?(<ul>[\\s\\S]*?</ul>)`).exec(notes)?.[1];

	return {
		version,
		urls: () => [
			{ url, architecture: 'x86' },
			{ url, architecture: 'x64' },
		],
		releaseNotes: entry
			? { source: 'html', sourceUrl: `data:text/html,${encodeURIComponent(entry)}`, releaseNotesUrl, cleanup: false }
			: { releaseNotesUrl },
	};
});
