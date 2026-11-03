import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The downloads page lists the newest MSI first; its folder name is the package
// version. The change log section for that build becomes the release notes, passed
// to the html source as a data: URL so the rest of the page is left out.
const base = 'http://www.gcndevelopment.com/gnuradio';

export default defineShard(async () => {
	const downloads = await fetch(`${base}/downloads.htm`).then((response) => response.text());
	const {
		captures: { version, file, app },
	} = match(
		downloads,
		/downloads\/installers\/v(?<version>\d+(?:\.\d+)+)\/(?<file>gnuradio_(?<app>\d+(?:\.\d+)+)_win64\.msi)/,
	);

	const changeLog = await fetch(`${base}/change_log.htm`).then((response) => response.text());
	const heading = `<strong>v${app.replaceAll('.', '\\.')}/`;
	const {
		groups: [entry],
	} = match(changeLog, new RegExp(`${heading}[\\s\\S]*?</p>([\\s\\S]*?)(?=<p[^>]*><strong>v\\d|</body>)`));

	return {
		version,
		urls: () => [`${base}/downloads/installers/v${version}/${file}`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${base}/change_log.htm`,
			cleanup: false,
		},
	};
});
