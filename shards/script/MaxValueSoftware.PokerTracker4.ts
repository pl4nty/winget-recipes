import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the versioned Windows installer and embeds cumulative
// release notes; only the newest entry (up to the previous "<x> Release" marker)
// becomes the release notes, passed to the html source as a data: URL.
const page = 'https://www.pokertracker.com/products/PT4/download.php';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /\?file=PokerTracker4-Install-x64-v(?<version>\d+(?:\.\d+)+)\.exe/);
	const {
		groups: [entry],
	} = match(html, /class="release-notes-popup"[^>]*>\s*<h4>Release Notes<\/h4>\s*<div>([\s\S]*?)(?=<br\s*\/?>\s*<b>[\d.]+ Release<\/b>|<\/div>)/);

	return {
		version,
		urls: () => [`${page}?file=PokerTracker4-Install-x64-v${version}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
