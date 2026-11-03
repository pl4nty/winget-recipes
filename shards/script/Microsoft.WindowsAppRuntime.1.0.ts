import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The stable 1.0 release notes list servicing releases newest first. The first
// "Version 1.0.x" heading gives the version (also used in the aka.ms URLs) and
// the anchor; its Bug fixes section becomes the release notes, passed to the
// html source as a data: URL so the rest of the page is left out.
const page = 'https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-1-0?pivots=stable';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { anchor, version, notes },
	} = match(
		html,
		/<h2 id="(?<anchor>version-10\d+)">Version (?<version>1\.0\.\d+)<\/h2>\s*<details><summary>[^<]*<\/summary>(?<notes>[\s\S]*?)<\/details>/,
	);
	const base = `https://aka.ms/windowsappsdk/1.0/${version}`;

	return {
		version,
		urls: () => [
			`${base}/windowsappruntimeinstall-${version}-x64.exe`,
			`${base}/windowsappruntimeinstall-${version}-x86.exe`,
			`${base}/windowsappruntimeinstall-${version}-arm64.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes.replace(/<\/?blockquote>/g, ''))}`,
			releaseNotesUrl: `${page}#${anchor}`,
			cleanup: false,
		},
	};
});
