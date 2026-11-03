import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page links the current setup exe. Its changelog is the matching section of the
// What's New page, passed to the html source as a data: URL so the rest of the page is left out.
// The one setup exe installs on both x86 and x64.
const notesPage = 'https://www.ntwind.com/software/visual-subst/what-is-new.html';

export default defineShard(async () => {
	const page = await fetch('https://www.ntwind.com/software/visual-subst.html').then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /\/VSubst_(?<version>\d+(?:\.\d+)+)-setup\.exe/);
	const url = `https://www.ntwind.com/files/VSubst_${version}-setup.exe`;

	const notes = await fetch(notesPage).then((response) => response.text());
	const section = notes.match(
		new RegExp(`<p>Changelog for Visual Subst v${version.replaceAll('.', '\\.')} [^<]*</p>\\s*(<ul>[\\s\\S]*?</ul>)`),
	)?.[1];

	return {
		version,
		urls: () => [
			{ url, architecture: 'x86' },
			{ url, architecture: 'x64' },
		],
		releaseNotes: section
			? {
					source: 'html',
					sourceUrl: `data:text/html,${encodeURIComponent(section)}`,
					releaseNotesUrl: notesPage,
					cleanup: false,
				}
			: { releaseNotesUrl: notesPage },
	};
});
