import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release notes page is mostly navigation and download links, so only its
// heading, summary and notes are passed to the html source, as a data: URL.
export default defineShard(async () => {
	const versions = await fetch('https://product-details.mozilla.org/1.0/firefox_versions.json').then((response) => response.json());
	const version: string = versions.LATEST_FIREFOX_VERSION;

	const page = `https://www.firefox.com/en-US/firefox/${version}/releasenotes/`;
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { title, summary, notes },
	} = match(
		html,
		/<div class="c-release-first-title[^"]*">(?<title>[^<]*)<\/div>\s*<div class="c-release-first-text">(?<summary>[\s\S]*?)<\/div>[\s\S]*?<section class="c-release-notes[^"]*">(?<notes>[\s\S]*?)<\/section>/,
	);
	const base = `https://download-installer.cdn.mozilla.net/pub/firefox/releases/${version}`;

	return {
		version,
		urls: () => [
			`${base}/win32/bg/Firefox%20Setup%20${version}.exe`,
			`${base}/win64/bg/Firefox%20Setup%20${version}.exe`,
			`${base}/win64-aarch64/bg/Firefox%20Setup%20${version}.exe`,
			`${base}/win32/bg/Firefox%20Setup%20${version}.msi`,
			`${base}/win64/bg/Firefox%20Setup%20${version}.msi`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<p>${title.trim()}</p>${summary}${notes}`)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
