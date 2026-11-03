import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The What's New page lists every version. The newest entry becomes the release
// notes: it is passed to the html source as a data: URL so the rest of the page
// is left out.
const page = 'https://www.proscan.org/proscan_whats_new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, entry },
	} = match(html, /<b>Version\s+(?<version>\d+\.\d+)<\/b><font[^>]*>&nbsp;\s*Newest Version[\s\S]*?(?<entry><ul>[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => [
			{
				url: `https://www.proscan.org/ProScan_${version.replaceAll('.', '_')}.zip`,
				architecture: 'x86',
				nestedInstallerMatches: ['ProScan_'],
			},
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
