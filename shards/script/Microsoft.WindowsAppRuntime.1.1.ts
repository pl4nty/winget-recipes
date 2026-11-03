import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The stable 1.1 release notes list servicing releases newest first. The first
// heading gives the version (1.1 headings carry no separate build, so the
// version is also the aka.ms path segment) and the anchor; its Bug fixes
// section becomes the release notes, passed to the html source as a data: URL
// so the rest of the page is left out.
const page = 'https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-1-1?pivots=stable';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { anchor, version, notes },
	} = match(
		html,
		/<h2 id="(?<anchor>version-11\d+)">Version (?<version>1\.1\.\d+)<\/h2>\s*<details><summary>[^<]*<\/summary>(?<notes>[\s\S]*?)<\/details>/,
	);
	const base = `https://aka.ms/windowsappsdk/1.1/${version}`;

	return {
		version,
		urls: () => [
			`${base}/windowsappruntimeinstall-x64.exe`,
			`${base}/windowsappruntimeinstall-x86.exe`,
			`${base}/windowsappruntimeinstall-arm64.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes.replace(/<\/?blockquote>/g, ''))}`,
			releaseNotesUrl: `${page}#${anchor}`,
			cleanup: false,
		},
	};
});
