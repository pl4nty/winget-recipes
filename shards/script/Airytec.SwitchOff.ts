import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The change log lists every release, newest first, each with its notes and
// its versioned download link. The newest entry's notes are passed to the
// html source as a data: URL so the rest of the page is left out.
const page = 'https://www.airytec.com/en/switch-off/history.aspx';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, notes, path },
	} = match(
		html,
		/<b>Switch Off (?<version>\d+(?:\.\d+)+)<\/b>[\s\S]*?<br \/>(?<notes>[\s\S]*?)<br \/>[\s\S]*?<a href="(?<path>\/files\/[^"]+\.exe)"/,
	);
	const url = new URL(path, page).href;

	return {
		version,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url, architecture: 'x86' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<p>${notes.trim()}</p>`)}`,
			releaseNotesUrl: 'https://www.airytec.com/switch-off/history.aspx',
			cleanup: false,
		},
		replace: true,
	};
});
