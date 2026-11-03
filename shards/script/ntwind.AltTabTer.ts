import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The What's New page lists Alt-Tab Terminator releases newest first. Its first
// entry gives the version, the blog post link (ReleaseNotesUrl) and the changelog.
const page = 'https://www.ntwind.com/software/alttabter/what-is-new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { link, short, notes },
	} = match(
		html,
		/<h2><a href="(?<link>blog\/alt-tab-terminator-v(?<short>\d+(?:\.\d+)+)[^"]*\.html)">[^<]*<\/a><\/h2>(?<notes>[\s\S]*?)(?=<p><a href="https:\/\/www\.ntwind\.com\/software\/alttabter\.html">|<hr \/>)/,
	);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [`https://www.ntwind.com/download/AltTabTer_${short}-setup.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: new URL(link, 'https://www.ntwind.com/').href,
			cleanup: false,
		},
	};
});
