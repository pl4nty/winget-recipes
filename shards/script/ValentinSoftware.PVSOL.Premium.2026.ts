import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page's Release Notes accordion lists the newest "PV*SOL premium 2026 Release N"
// first. The download is setup_pvsolpremium_<year>_<N>.exe and the package version is <year>.<N>.
// That entry alone becomes the release notes, passed as a data: URL so the rest of the page is left out.
const page = 'https://valentin-software.com/en/products/pvsol-premium/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { year, release, notes },
	} = match(
		html,
		/<h4 class="title">Release Notes<\/h4>[\s\S]*?PV\*SOL premium (?<year>2026) Release (?<release>\d+)<\/div>\s*<div class="answer">(?<notes>[\s\S]*?)<\/div><\/div>\s*(?:<div class="question">|<\/div>)/,
	);

	return {
		version: `${year}.${release}`,
		urls: () => [`https://downloads.valentin.de/pvsol/setup_pvsolpremium_${year}_${release}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${page}#release-notes`,
			cleanup: false,
		},
	};
});
