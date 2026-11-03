import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's download page links the current Windows installer, which lives
// on a GitHub release whose tag is not the version, so the tag and version are
// both taken from that link. Upstream keeps a four-part version, so the short
// version is padded with zeros. The release notes are that version's section of
// the vendor's changes page, passed to the html source as a data: URL.
const changes = 'https://www.trelby.org/changes/';

export default defineShard(async () => {
	const download = await fetch('https://www.trelby.org/download/').then((response) => response.text());
	const {
		captures: { tag, short },
	} = match(
		download,
		/https:\/\/github\.com\/trelby\/trelby\/releases\/download\/(?<tag>[^/"]+)\/Setup-Trelby-(?<short>\d+(?:\.\d+)*)\.exe/,
	);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	const html = await fetch(changes).then((response) => response.text());
	const start = html.indexOf(`<strong>${short}:</strong>`);
	const section = start === -1 ? '' : html.slice(start).split(/<h3>/)[0];
	const notes = section.replace(/^<strong>[^<]*<\/strong><br \/>\s*<em><\/em><\/h3>/, '');

	return {
		version,
		urls: () => [`https://github.com/trelby/trelby/releases/download/${tag}/Setup-Trelby-${short}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: changes,
			cleanup: false,
		},
	};
});
