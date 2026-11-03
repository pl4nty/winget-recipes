import { defineShard } from 'anthelion';

// Simego's release notes page lists every Data Sync Studio build as an h4
// heading such as "6.0. 3680 - 16/10/2026" (id 60-3680---16102026), oldest
// first. The newest heading gives the version; its section becomes the release
// notes, passed to the html source as a data: URL so the rest of the page is
// left out. The download zip is named after the version and holds the Inno
// Setup exe in a folder of the same name.
const page = 'https://docs.simego.com/licensing/release-notes/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const entries = [...html.matchAll(/<h4[^>]*\bid=(\d)(\d)-(\d+)---\d+[^>]*>/g)].map((heading) => ({
		version: `${heading[1]}.${heading[2]}.${heading[3]}`,
		build: Number(heading[3]),
		index: heading.index,
	}));
	if (entries.length === 0) throw new Error('No release headings found on the Simego release notes page');
	const latest = entries.reduce((newest, entry) => (entry.build > newest.build ? entry : newest));
	const rest = html.slice(latest.index);
	const end = rest.slice(1).search(/<h[1-4][\s>]|<\/div>/);
	const section = end === -1 ? rest : rest.slice(0, end + 1);

	const { version } = latest;
	const majorMinor = version.split('.').slice(0, 2).join('_');

	return {
		version,
		urls: () => [
			{
				url: `https://downloads.simego.com/datasync/${version}.zip`,
				architecture: 'x64',
				nestedInstallerMatches: [`${version}/datasync_studio_setup_${majorMinor}_x64.exe`],
			},
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(section)}`,
			releaseNotesUrl: 'https://docs.simego.com/licensing/release-notes',
			cleanup: false,
		},
	};
});
