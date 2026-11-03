import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the current MSI through a getfile URL with a per-build
// hash, and the release notes page has one <h3 id="<version>"> section per release.
export default defineShard(async () => {
	const download = await fetch('https://www.rebex.net/drive/download/').then((response) => response.text());
	const {
		captures: { url, version },
	} = match(
		download,
		/(?<url>https:\/\/www\.rebex\.net\/getfile\/[0-9a-f]{32}\/RebexDrive-(?<version>\d+(?:\.\d+)+)\.msi\/direct)/,
	);

	const page = 'https://www.rebex.net/drive/release-notes/';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { notes },
	} = match(
		html,
		new RegExp(`<h3 id="${version.replaceAll('.', '\\.')}">[^<]*</h3>(?<notes>[\\s\\S]*?)(?=<h3 |</div>)`),
	);

	return {
		version,
		urls: () => [{ url, architecture: 'x64' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#${version}`,
			cleanup: false,
		},
	};
});
