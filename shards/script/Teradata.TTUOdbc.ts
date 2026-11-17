import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The ODBC download page lists the latest version with its release date, and the zip is
// uploaded under sites/default/files/<year>-<month>/ with the version padded to four parts.
const page = 'https://downloads.teradata.com/download/connectivity/odbc-driver/windows';
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The 32-bit TTUSuiteSilent.exe bootstrapper installs the x64 MSIs (x64/TDODBC-64bit) on 64-bit Windows
export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version, month, year },
	} = match(
		html,
		/id="versiondropdown1"[^>]*><div>(?<version>\d+\.\d+\.\d+)<\/div><span>\d+ (?<month>[A-Z][a-z]{2}) (?<year>\d{4})<\/span>/,
		'No Teradata ODBC version found',
	);
	const index = months.indexOf(month);
	if (index === -1) throw new Error(`Unknown month ${month}`);
	const file = `TeradataODBC__windows_indep.${version}.00.zip`;
	// The upload folder can be a month later than the listed release date
	const candidates = [0, 1].map((offset) => {
		const date = new Date(Date.UTC(Number(year), index + offset, 1));
		const folder = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
		return `https://downloads.teradata.com/sites/default/files/${folder}/${file}`;
	});
	let url: string | undefined;
	for (const candidate of candidates) {
		const response = await fetch(candidate, { method: 'HEAD' });
		if (response.ok) {
			url = candidate;
			break;
		}
	}
	if (!url) throw new Error(`No Teradata ODBC zip found for ${version}`);

	return {
		version: `${version}.00`,
		urls: () => [{ url, architecture: 'x64' }],
		releaseNotes: { releaseNotesUrl: page },
	};
});
