import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The downloads page lists stable and early access builds; only the newest
// early access release notes entry is passed to the html source, as a data: URL.
export default defineShard(async () => {
	const page = 'https://www.picoauto.com/downloads';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(
		html,
		/https:\/\/www\.picoauto\.com\/download\/software\/beta\/PicoScope_7_Automotive_Early_Access_(?<version>[\d.]+)\.x64\.exe/,
	);
	const {
		captures: { notes },
	} = match(
		html,
		/data-release-notes-content="early-access-drawer">[\s\S]*?<div class="release-notes-content[^"]*">(?<notes>[\s\S]*?)<\/article>/,
	);
	const base = `https://www.picoauto.com/download/software/beta/PicoScope_7_Automotive_Early_Access_${version}`;

	return {
		version,
		urls: () => [`${base}.x64.exe`, `${base}.arm64.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
