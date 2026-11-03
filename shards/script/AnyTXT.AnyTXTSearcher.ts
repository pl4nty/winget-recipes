import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The SourceForge file feed gives the newest Windows build. The vendor's
// download page holds the changelog: the entry for this version (or the newest
// entry when the build has none yet) becomes the release notes, passed to the
// html source as a data: URL so the rest of the page is left out.
const page = 'https://anytxt.net/download/';

export default defineShard(async () => {
	const feed = await fetch('https://sourceforge.net/projects/anytxt/rss?limit=100').then((response) => response.text());
	const versions = [...feed.matchAll(/\/Anytxt_(\d+(?:\.\d+)+)_Windows_X86_64\.exe/g)].map(([, version]) => version!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No Windows x64 installer found in the SourceForge feed');

	const html = await fetch(page).then((response) => response.text());
	const entries = [...html.matchAll(/<p[^>]*>[^<]*Version (\d+(?:\.\d+)+)<\/p>[\s\S]*?(?=<p[^>]*>[^<]*Version \d|<\/div>|<h\d)/g)];
	const entry = entries.find(([, entryVersion]) => entryVersion === version) ?? entries[0];
	if (!entry) throw new Error('No release notes found on the download page');

	return {
		version,
		urls: () => [
			`https://sourceforge.net/projects/anytxt/files/Anytxt_${version}_Windows_X86_32.exe/download`,
			`https://sourceforge.net/projects/anytxt/files/Anytxt_${version}_Windows_X86_64.exe/download`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry[0])}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
