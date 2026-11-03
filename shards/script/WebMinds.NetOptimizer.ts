import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The version history's newest entry links the versioned setup and lists the
// changes, which are passed to the html source as a data: URL so the rest of
// the page is left out.
const page = 'https://www.netoptimizer.com/version-history/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, url, notes },
	} = match(
		html,
		/Version (?<version>\d+(?:\.\d+)+) &#8211;[^<]*<a href="(?<url>https:\/\/www\.netoptimizer\.com\/files\/NetOptimizer[\d.]+\.exe)"[\s\S]*?<\/h4>\s*(?<notes><ul[\s\S]*?)\s*<h4/,
	);

	return {
		version,
		urls: () => [url],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
