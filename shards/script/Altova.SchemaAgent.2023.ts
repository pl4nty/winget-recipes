import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const range = async (url: string, start: number, length: number) => {
	const response = await fetch(url, { headers: { Range: `bytes=${start}-${start + length - 1}` } });
	if (response.status !== 206) throw new Error(`No partial content from ${url}: ${response.status}`);
	return new DataView(await response.arrayBuffer());
};

// Reads the installer's VS_FIXEDFILEINFO product version with range requests instead of downloading the whole installer.
const productVersion = async (url: string) => {
	const header = await range(url, 0, 4096);
	const pe = header.getUint32(0x3c, true);
	const table = pe + 24 + header.getUint16(pe + 20, true);
	let rsrc: { address: number; offset: number } | undefined;
	for (let i = 0; i < header.getUint16(pe + 6, true); i++) {
		const entry = table + 40 * i;
		const name = new TextDecoder().decode(new Uint8Array(header.buffer, entry, 8)).replace(/\0+$/, '');
		if (name === '.rsrc') rsrc = { address: header.getUint32(entry + 12, true), offset: header.getUint32(entry + 20, true) };
	}
	if (!rsrc) throw new Error(`No resource section in ${url}`);
	const directory = await range(url, rsrc.offset, 65536);
	const child = (offset: number, id?: number) => {
		const count = directory.getUint16(offset + 12, true) + directory.getUint16(offset + 14, true);
		for (let i = 0; i < count; i++) {
			const entry = offset + 16 + 8 * i;
			if (id === undefined || directory.getUint32(entry, true) === id) return directory.getUint32(entry + 4, true) & 0x7fffffff;
		}
		throw new Error(`No version resource in ${url}`);
	};
	const data = child(child(child(0, 16)));
	const info = await range(url, directory.getUint32(data, true) - rsrc.address + rsrc.offset, directory.getUint32(data + 4, true));
	for (let i = 0; i + 24 <= info.byteLength; i += 4) {
		if (info.getUint32(i, true) !== 0xfeef04bd) continue;
		const [high, low] = [info.getUint32(i + 16, true), info.getUint32(i + 20, true)];
		return [high >>> 16, high & 0xffff, low >>> 16, low & 0xffff];
	}
	throw new Error(`No fixed file info in ${url}`);
};

// The archive on the download page lists releases newest first, so the first 2023 entry is the line's final update.
export default defineShard(async () => {
	const page = await fetch('https://www.altova.com/schemaagent/download').then((response) => response.text());
	const {
		captures: { release },
	} = match(page, /<option value="(?<release>2023(?:r\d+)?(?:sp\d+)?)">/, 'No 2023 release on the download page');
	const file = `SchemaAgent${release.replace('r', 'rel')}`;
	const locales = [
		['en', ''],
		['de', '_DE'],
		['es', '_ES'],
		['fr', '_FR'],
		['jp', '_JP'],
	];
	const urls = locales.flatMap(([folder, suffix]) =>
		['', '_x64'].map((arch) => `https://cdn.sw.altova.com/v${release}/${folder}/${file}${arch}${suffix}.exe`),
	);
	// Installers carry the product version (e.g. 26.2.1.0 for 2024r2sp1), published as year.minor.build with a revision only when it is set.
	const [, minor, build, revision] = await productVersion(urls[0]!);
	const parts = [release.slice(0, 4), minor, build, ...(revision ? [revision] : [])];

	return {
		version: parts.map((part) => String(part).padStart(2, '0')).join('.'),
		urls: () => urls,
		releaseNotes: { releaseNotesUrl: 'https://www.altova.com/support/release-notes' },
	};
});
