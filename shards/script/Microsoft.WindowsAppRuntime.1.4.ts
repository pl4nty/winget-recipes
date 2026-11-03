import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The stable 1.4 release notes list servicing releases newest first. The first
// heading gives the version, the build used in the aka.ms URLs and the anchor;
// its Bugfixes section becomes the release notes, passed to the html source as
// a data: URL so the rest of the page is left out.
const page = 'https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-1-4?pivots=stable';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { anchor, version, build, notes },
	} = match(
		html,
		/<h2 id="(?<anchor>version-14\d+-\d+)">Version (?<version>1\.4\.\d+) \((?<build>1\.4\.\d+)\)<\/h2>\s*<details><summary>[^<]*<\/summary>(?<notes>[\s\S]*?)<\/details>/,
	);
	const base = `https://aka.ms/windowsappsdk/1.4/${build}`;

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
