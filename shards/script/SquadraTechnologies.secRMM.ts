import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download zips sit under a major.minor.0.0 folder (9.11.0.0 for every
// 9.11.x build), so read the full version from the newest release notes entry
// and derive the folder from it. That entry's list becomes the release notes.
const page = 'https://www.squadratechnologies.com/Products/secRMM/secRMMReleaseNotes.aspx';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [, , entry],
		captures: { version, major, minor },
	} = match(
		html,
		/<li>\s*<strong>\d{2}\/\d{2}\/\d{4} - (?<version>(?<major>\d+)\.(?<minor>\d+)\.\d+\.\d+)<\/strong>\s*(<ul[\s\S]*?<\/ul>)/,
	);
	const base = `https://www.squadratechnologies.com/StaticContent/ProductDownload/secRMM/${major}.${minor}.0.0`;

	return {
		version,
		urls: () => [`${base}/secRMMInstallx86.zip`, `${base}/secRMMInstallx64.zip`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
