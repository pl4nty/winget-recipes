import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's update feed gives the version and the MSI path. The release notes
// page has one article per version; when it lists the new version, that article
// becomes the release notes (as a data: URL so the rest of the page is left out).
const notesPage = 'https://rune-launcher.com/release-notes';

export default defineShard(async () => {
	const feed = (await fetch('https://downloads.rune-launcher.com/latest.json').then((response) => response.json())) as {
		version: string;
	};
	const version = match(feed.version, /^\d+(?:\.\d+)+$/).groups[0];

	const html = await fetch(notesPage).then((response) => response.text());
	const id = `version-${version.replaceAll('.', '-')}`;
	const entry = html.match(new RegExp(`<article id="${id}"[\\s\\S]*?</article>`))?.[0];

	return {
		version,
		urls: () => [`https://downloads.rune-launcher.com/releases/${version}/windows/Rune_${version}_x64_en-US.msi`],
		releaseNotes: entry
			? {
					source: 'html',
					sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
					releaseNotesUrl: `${notesPage}#${id}`,
					cleanup: false,
				}
			: { releaseNotesUrl: notesPage },
	};
});
