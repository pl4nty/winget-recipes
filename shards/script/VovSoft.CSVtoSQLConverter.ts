import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URLs are unversioned, so the version and release notes come
// from the first entry of the vendor's version history page. Upstream keeps a
// four-part version (2.1.0.0), so the page version is padded with zeros.
export default defineShard(async () => {
	const page = 'https://vovsoft.com/version-history/csv-to-sql-converter/';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { short, notes },
	} = match(
		html,
		/<span class="notranslate">CSV to SQL Converter (?<short>\d+(?:\.\d+)*)<\/span>[\s\S]*?<div class="w3-twothird">(?<notes>[\s\S]*?)<\/div>/,
	);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => [
			{ url: 'https://files.vovsoft.com/csv-to-sql-converter.exe', architecture: 'x64' },
			'https://files.vovsoft.com/csv-to-sql-converter-portable.zip',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
