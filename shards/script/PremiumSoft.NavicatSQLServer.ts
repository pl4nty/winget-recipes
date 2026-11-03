import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download URLs only carry the major version (navicat17_sqlserver_<language>_x64.exe),
// so the version comes from the vendor's release notes page. That page mixes
// two release lines; this package tracks the Navicat 17 line its ProductCode names,
// so only titles in that line are matched (the newest entry of the line is first).
const SERIES = '17';
const LANGUAGES = ['es', 'en', 'cs', 'ct', 'id', 'jp', 'de', 'ru', 'pl', 'fr', 'kr', 'th'];

export default defineShard(async () => {
	const page = 'https://www.navicat.com/products/navicat-for-sqlserver-release-note';
	const html = await fetch(page).then((response) => response.text());
	const version = match(
		html,
		new RegExp(`Navicat for SQL Server \\(Windows\\) version (${SERIES}\\.\\d+\\.\\d+)<`),
	).groups[0];
	const major = version.split('.')[0].padStart(2, '0');

	return {
		version,
		urls: () =>
			LANGUAGES.map((language) => `https://download3.navicat.com/download/navicat${major}_sqlserver_${language}_x64.exe`),
		releaseNotes: { releaseNotesUrl: page },
	};
});
