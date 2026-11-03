import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Honeyview download URLs are unversioned, so read the version from the
// version history page. Its newest entry becomes the release notes: it is
// passed to the html source as a data: URL so the rest of the page is left out.
const page = 'https://en.bandisoft.com/honeyview/history/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
		captures: { version },
	} = match(html, /<h1>Honeyview Version History<\/h1>\s*(<h2>(?:<font[^>]*>)?v(?<version>\d+(?:\.\d+)+)[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => [
			'https://bandisoft.app/honeyview/HONEYVIEW-SETUP.EXE',
			'https://bandisoft.app/honeyview.kr/HONEYVIEW-SETUP-KR.EXE',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
