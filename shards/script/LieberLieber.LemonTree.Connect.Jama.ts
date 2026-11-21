import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The help site has one release page per minor line; the newest page lists the newest patch first.
export default defineShard(async () => {
	const base = 'https://help.lieberlieber.com/jama/';
	const index = await fetch(`${base}index.html`).then((response) => response.text());
	const pages = [...index.matchAll(/href="(Release-(\d+)\.(\d+)(?:\.x)?\.html)"/g)];
	if (!pages.length) throw new Error('No release pages found');
	pages.sort((a, b) => Number(b[2]) - Number(a[2]) || Number(b[3]) - Number(a[3]));
	const page = `${base}${pages[0][1]}`;
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /<h2 id="[^"]*">LemonTree\.Connect for [^<]*?(?<version>\d+\.\d+\.\d+)<\/h2>/, 'No release found');

	return {
		version,
		urls: () => [`https://customers.lieberlieber.com/Downloads/LemonTree/Connect/Jama/LemonTree.Connect.Jama_${version}.zip`],
		releaseNotes: { releaseNotesUrl: page },
	};
});
