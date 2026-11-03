import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's install page links the current installer, whose file name has a
// four-part version; upstream uses its first three parts. The same exe serves
// both architectures, as upstream lists it. Release notes are that version's
// section of the vendor's releases page, passed as a data: URL.
const releases = 'https://www.radpdf.com/releases/';

export default defineShard(async () => {
	const install = await fetch('https://www.radpdf.com/install/').then((response) => response.text());
	const {
		captures: { full },
	} = match(install, /downloads\.radpdf\.com\/RadPdfInstaller\.(?<full>\d+(?:\.\d+)+)\.exe/);
	const version = full.split('.').slice(0, 3).join('.');
	const short = full.split('.').slice(0, 2).join('.');
	const url = `https://downloads.radpdf.com/RadPdfInstaller.${full}.exe`;

	const html = await fetch(releases).then((response) => response.text());
	const open = `<div id="v${short}" class="rVersion">`;
	const start = html.indexOf(open);
	const notes = start === -1 ? '' : html.slice(start + open.length).split(/<div id="v\d/)[0];

	return {
		version,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url, architecture: 'x86' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${releases}#v${short}`,
			cleanup: false,
		},
	};
});
