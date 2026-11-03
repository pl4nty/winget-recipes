import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release log lists builds newest first. Its newest entry gives the version (the MSI lives
// under release<major>_<minor>_<build>/) and becomes the release notes as a data: URL, so the
// older builds on the page are left out.
const page = 'https://www.vectorstyler.com/releaselog/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
		captures: { anchor, version },
	} = match(html, /(<h3 id="(?<anchor>build-\d+)">Build (?<version>\d+\.\d+\.\d+)<\/h3>[\s\S]*?)(?=<h3 |<\/article>)/);

	return {
		version,
		urls: () => [`https://www.vectorstyler.com/release/release${version.replaceAll('.', '_')}/vectorstyler.msi`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${page}#${anchor}`,
			cleanup: false,
		},
	};
});
