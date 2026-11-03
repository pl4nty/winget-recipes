import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// SourceForge keeps one folder per bitness. Installers are named lazarus-{version}-fpc-{fpc}-win{bits}.exe,
// where the bundled Free Pascal version is not derivable from the Lazarus version, so both are read
// from each folder's RSS feed. Release candidates (5.0RC1) and cross-compiler variants do not match.
const folders = { 32: 'Lazarus Windows 32 bits', 64: 'Lazarus Windows 64 bits' } as const;

async function installers(bits: 32 | 64) {
	const feed = await ky(
		`https://sourceforge.net/projects/lazarus/rss?path=/${encodeURIComponent(folders[bits])}&limit=200`,
		{ timeout: 60_000 },
	).text();
	const pattern = new RegExp(
		`/Lazarus (\\d+(?:\\.\\d+)+)/(lazarus-\\1-fpc-\\d+(?:\\.\\d+)+-win${bits}\\.exe)`,
		'g',
	);
	return new Map([...feed.matchAll(pattern)].map(([, version, file]) => [version!, file!]));
}

export default defineShard(async () => {
	const [win32, win64] = await Promise.all([installers(32), installers(64)]);
	const version = [...win64.keys()]
		.filter((v) => win32.has(v))
		.sort(compareVersions)
		.at(-1);
	if (!version) {
		throw new Error('No stable Lazarus release with both win32 and win64 installers found');
	}
	const url = (bits: 32 | 64, file: string) =>
		`https://sourceforge.net/projects/lazarus/files/${encodeURIComponent(folders[bits])}/${encodeURIComponent(`Lazarus ${version}`)}/${file}/download`;

	return {
		version,
		urls: () => [url(32, win32.get(version)!), url(64, win64.get(version)!)],
	};
});
