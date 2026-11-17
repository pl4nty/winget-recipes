import { defineShard } from 'anthelion';

// Stable Windows installers are archived as ohrrpgce-win-installer-<YYYY-MM-DD>-<codename>.exe;
// upstream versions them by release date (YYYY.MM.DD). Nightlies live elsewhere (nightly/).
export default defineShard(async () => {
	const response = await fetch('https://hamsterrepublic.com/ohrrpgce/archive/');
	if (!response.ok) throw new Error(`OHRRPGCE archive returned HTTP ${response.status}`);
	const html = await response.text();
	const files = [...html.matchAll(/ohrrpgce-win-installer-(\d{4})-(\d{2})-(\d{2})-[\w+]+\.exe/g)].map((m) => ({
		file: m[0],
		date: `${m[1]}.${m[2]}.${m[3]}`,
	}));
	if (files.length === 0) throw new Error('No ohrrpgce-win-installer-<date>-<codename>.exe in the archive listing');
	const latest = files.reduce((a, b) => (b.date > a.date ? b : a));

	return {
		version: latest.date,
		urls: () => [`https://hamsterrepublic.com/ohrrpgce/archive/${latest.file}`],
		releaseNotes: { releaseNotesUrl: 'https://hamsterrepublic.com/ohrrpgce/Downloads.html' },
	};
});
