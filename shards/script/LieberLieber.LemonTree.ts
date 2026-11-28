import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The help site has one release notes page per minor release, whose table of contents starts with the newest patch release.
const HELP = 'https://help.lieberlieber.com/LemonTree/';

export default defineShard(async () => {
	const index = await fetch(`${HELP}index.html`).then((response) => response.text());
	const pages = [...index.matchAll(/href="(Release-(\d+\.\d+)\.x\.html)"/g)];
	const latest = pages.sort((a, b) => compareVersions(b[2]!, a[2]!))[0];
	if (!latest) throw new Error('No LemonTree release notes page found');
	const notes = `${HELP}${latest[1]}`;
	const page = await fetch(notes).then((response) => response.text());
	const {
		captures: { version, anchor },
	} = match(page, /href="#(?<anchor>lemontree-\d+)" class="md-nav__link">\s*LemonTree (?<version>\d+\.\d+\.\d+)\s*</, `No release in ${notes}`);

	return {
		version,
		urls: () => [`https://customers.lieberlieber.com/Downloads/LemonTree/LemonTree.Desktop.Windows_${version}.zip`],
		releaseNotes: { releaseNotesUrl: `${notes}#${anchor}` },
	};
});
