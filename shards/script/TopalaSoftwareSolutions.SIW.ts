import { defineShard } from 'anthelion';

// Download folders look like /download/20261014f/ (x64) and /download/20261014f-arm64/.
// The date gives the first three version parts; the letter suffix gives the build
// (no letter = 0, a = 1, b = 2, ...), e.g. 20261014f -> 2026.10.14.6.
export default defineShard(async () => {
	const page = await fetch('https://www.gtopala.com/download/').then((response) => response.text());
	const found = /\/download\/(\d{4})(\d{2})(\d{2})([a-z]?)\/siwtrial-setup\.exe/.exec(page);
	if (!found) throw new Error('SIW download link not found');
	const [, year, month, day, letter] = found;
	const folder = `${year}${month}${day}${letter}`;
	const build = letter ? letter.charCodeAt(0) - 96 : 0;

	return {
		version: `${year}.${month}.${day}.${build}`,
		urls: () => [
			{ url: `https://www.gtopala.com/download/${folder}/siwtrial-setup.exe`, architecture: 'x64' },
			{ url: `https://www.gtopala.com/download/${folder}-arm64/siwtrial-setup.exe`, architecture: 'arm64' },
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.gtopala.com/releases/index.php',
		},
	};
});
