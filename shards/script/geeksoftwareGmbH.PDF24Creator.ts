import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The creator page states the current version; the changelog page holds every
// release, so only that version's entry is passed to the html source as a data: URL.
const changelog = 'https://creator.pdf24.org/changelog/';

export default defineShard(async () => {
	const page = await fetch('https://tools.pdf24.org/en/creator').then((response) => response.text());
	const version = match(page, /"softwareVersion":\s*"(\d+(?:\.\d+)+)"/).groups[0];

	const notes = await fetch(changelog).then((response) => response.text());
	const id = `v${version}`;
	const start = notes.indexOf(`<div id="${id}"`);
	if (start < 0) throw new Error(`Changelog has no entry for ${version}`);
	const next = notes.indexOf('<div id="v', start + 1);
	const entry = notes.slice(start, next < 0 ? undefined : next);

	const base = `https://download.pdf24.org/pdf24-creator-${version}`;
	return {
		version,
		urls: () => [
			`${base}-x64.msi`,
			`${base}-x64.exe`,
			`${base}-x86.msi`,
			`${base}-x86.exe`,
			`${base}-arm64.msi`,
			`${base}-arm64.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${changelog}#${id}`,
			cleanup: false,
		},
	};
});
