import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The release-note page lists every Windows build (newest major and older
// maintenance branches interleaved), so take the greatest version and pass
// only its entry to the html source as a data: URL.
const page = 'https://www.navicat.com/en/products/navicat-data-modeler-release-note';
// Upstream installer order: es, en, zh-CN, zh-Hant, id, ja, de, ru, pl, fr, ko, th.
const languages = ['es', 'en', 'cs', 'ct', 'id', 'jp', 'de', 'ru', 'pl', 'fr', 'kr', 'th'];

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const versions = [...html.matchAll(/Navicat Data Modeler \(Windows\) version (\d+\.\d+\.\d+)</g)].map((entry) => entry[1]!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No Windows version found on the Navicat release-note page');
	const major = version.split('.')[0]!;

	const {
		groups: [notes],
	} = match(
		html,
		new RegExp(`Navicat Data Modeler \\(Windows\\) version ${version.replaceAll('.', '\\.')}<[\\s\\S]*?</tr>\\s*<tr>\\s*<td>([\\s\\S]*?)(?:<p>To upgrade,[\\s\\S]*?)?</td>\\s*</tr>`),
	);

	return {
		version,
		urls: () => languages.map((language) => `https://download3.navicat.com/download/navicatdatamodeler${major.padStart(2, '0')}_${language}_x64.exe`),
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: 'https://www.navicat.com/products/navicat-data-modeler-release-note',
			cleanup: false,
		},
	};
});
