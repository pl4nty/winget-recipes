import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URLs are unversioned, so the version and release notes come
// from the first entry of the vendor's version history page. Upstream keeps a
// four-part version (1.0.0.0), so the page version is padded with zeros.
export default defineShard(async () => {
	const page = 'https://vovsoft.com/version-history/cpu-monitor-gadget/';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { short, notes },
	} = match(
		html,
		/<span class="notranslate">CPU Monitor Gadget (?<short>\d+(?:\.\d+)*)<\/span>[\s\S]*?<div class="w3-twothird">(?<notes>[\s\S]*?)<\/div>/,
	);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => ['https://files.vovsoft.com/cpu-monitor-gadget.exe', 'https://files.vovsoft.com/cpu-monitor-gadget-portable.zip'],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
