import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the versioned Windows setup. The changelog page lists
// every version in its own <article>; only the one for this version becomes the
// release notes, passed to the html source as a data: URL.
const changelog = 'https://the.talyh.com/changelog';

export default defineShard(async () => {
	const download = await fetch('https://the.talyh.com/download').then((response) => response.text());
	const {
		captures: { version },
	} = match(download, /downloads\.talyh\.com\/releases\/(?<version>\d+(?:\.\d+)+)\/The-\k<version>-setup\.exe/);

	const html = await fetch(changelog).then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		groups: [entry],
	} = match(html, new RegExp(`(<article[^>]*>(?:(?!</article>)[\\s\\S])*?<h3[^>]*>${escaped}</h3>[\\s\\S]*?</article>)`));

	return {
		version,
		urls: () => [`https://downloads.talyh.com/releases/${version}/The-${version}-setup.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
	};
});
