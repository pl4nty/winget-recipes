import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The changelog page has one section per release, keyed by version. The newest
// 15.x section becomes the release notes: it is passed to the html source as a
// data: URL so the rest of the page is left out.
const page = 'https://www.ej-technologies.com/jprofiler/changelog';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const versions = [...html.matchAll(/id="(15(?:\.\d+)+)"/g)].map(([, version]) => version);
	const [version] = versions.sort((a, b) => compareVersions(b, a));
	const {
		captures: { entry },
	} = match(
		html,
		new RegExp(`id="${version.replaceAll('.', '\\.')}"[\\s\\S]*?<div class="col-auto"></div>\\s*</div>(?<entry>[\\s\\S]*?)</section>`),
	);

	return {
		version,
		urls: () => [`https://download.ej-technologies.com/jprofiler/jprofiler_windows-x64_${version.replaceAll('.', '_')}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${page}#${version}`,
			cleanup: false,
		},
	};
});
