import { defineShard } from 'anthelion';

const YEAR = '2024';
const LANGUAGES = [
	['en', ''],
	['de', '_DE'],
	['es', '_ES'],
	['fr', '_FR'],
	['jp', '_JP'],
];

// The archive lists each release code (2024, 2024r2, 2024r2sp1, ...) newest first.
export default defineShard(async () => {
	const page = await fetch('https://www.altova.com/xmlspy-xml-editor/download').then((response) => response.text());
	const found = new RegExp(`<option value="(?<release>${YEAR}(?:r(?<r>\\d+))?(?:sp(?<sp>\\d+))?)"`).exec(page)?.groups;
	if (!found?.release) throw new Error(`No XMLSpy ${YEAR} release found`);
	const { release, r = '0', sp = '0' } = found;
	const file = `XMLSpyEnt${release.replace(/^(\d{4})r/, '$1rel')}`;

	return {
		version: `${YEAR}.${r.padStart(2, '0')}.${sp.padStart(2, '0')}`,
		urls: () =>
			LANGUAGES.flatMap(([folder, suffix]) => [
				`https://cdn.sw.altova.com/v${release}/${folder}/${file}${suffix}.exe`,
				`https://cdn.sw.altova.com/v${release}/${folder}/${file}_x64${suffix}.exe`,
			]),
		releaseNotes: { releaseNotesUrl: 'https://www.altova.com/support/release-notes' },
	};
});
