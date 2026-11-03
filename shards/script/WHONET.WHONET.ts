import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release notes page lists every version, newest first, each with its notes
// and its x64/x86 download links. The setup file name carries the product year
// (WHONET2026-...), which is taken from the link instead of being hardcoded.
export default defineShard(async () => {
	const releaseNotesUrl = 'https://whonet.org/WHONET-ReleaseNotes.html';
	const page = await fetch(releaseNotesUrl).then((response) => response.text());
	const {
		captures: { version, notes, file },
	} = match(
		page,
		/Version\s+(?<version>\d+(?:\.\d+)+)\s*<\/button>[\s\S]*?<div class="accordion-body">\s*(?<notes><ul>[\s\S]*?<\/ul>)[\s\S]*?href="\/releases\/(?<file>WHONET\d{4}-Setup)-x64-v\k<version>\.exe"/,
	);

	return {
		version,
		urls: () => [
			{ url: `https://whonet.org/releases/${file}-x86-v${version}.exe`, architecture: 'x86' },
			{ url: `https://whonet.org/releases/${file}-x64-v${version}.exe`, architecture: 'x64' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
