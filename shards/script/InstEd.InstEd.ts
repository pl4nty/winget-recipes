import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page lists the newest msi first. Its entry in the features page changelog
// becomes the release notes, passed as a data: URL so the rest of the page is left out.
const site = 'https://instedit.github.io/instedit_site';

export default defineShard(async () => {
	const download = await fetch(`${site}/download.html`).then((response) => response.text());
	const {
		captures: { version },
	} = match(download, /download2\.html\?file=InstEd-(?<version>\d+(?:\.\d+)+)\.msi/);

	const features = await fetch(`${site}/features2.html`).then((response) => response.text());
	const {
		groups: [notes],
	} = match(features, new RegExp(`<h4>\\s*${version.replaceAll('.', '\\.')}<br\\s*/?>\\s*</h4>\\s*(<ul>[\\s\\S]*?</ul>)`));

	return {
		version,
		urls: () => [`${site}/releases2/InstEd-${version}.msi`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `${site}/features2.html`,
			cleanup: false,
		},
	};
});
