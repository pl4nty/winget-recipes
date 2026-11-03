import { defineShard } from 'anthelion';

// The release notes page lists Windows and macOS builds together; each entry is an
// <article id="<version>"> with a platform badge. The newest Windows entry gives the
// version, which also names the vendor's versioned MSI, and its body is the release notes.
export default defineShard(async () => {
	const page = 'https://reincubate.com/support/camo/release-notes/';
	const html = await fetch(page).then((response) => response.text());
	const article = html
		.split('<article id="')
		.slice(1)
		.find((chunk) => /^\d+(?:\.\d+)+"/.test(chunk) && chunk.includes('</svg>Windows<'));
	if (!article) throw new Error('No Windows release found on the Camo release notes page');
	const version = article.slice(0, article.indexOf('"'));
	const body = article.slice(0, article.indexOf('</article>'));
	const notes = body.includes('</nav>') ? body.slice(body.indexOf('</nav>') + 6) : body;

	return {
		version,
		urls: () => [{ url: `https://releases.reincubate.com/camo/camo-windows-${version}.msi`, architecture: 'x64' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `https://reincubate.com/support/camo/release-notes/#${version}`,
			cleanup: false,
		},
	};
});
