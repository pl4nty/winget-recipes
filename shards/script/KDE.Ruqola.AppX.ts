import { inflateRawSync } from 'node:zlib';
import { defineShard } from 'anthelion';

// Reads Identity/@Version from AppxManifest.xml with HTTP range requests, so the whole
// sideload package (100+ MB) is not downloaded just to learn its version.
async function range(url: string, start: number, end: number) {
	const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
	if (response.status !== 206) throw new Error(`${url} does not support range requests (${response.status})`);
	return new Uint8Array(await response.arrayBuffer());
}

async function appxVersion(url: string) {
	const head = await fetch(url, { method: 'HEAD' });
	const size = Number(head.headers.get('content-length'));
	if (!head.ok || !size) throw new Error(`${url} returned ${head.status} without a size`);
	const tail = await range(url, Math.max(0, size - 65536), size - 1);
	const view = new DataView(tail.buffer);
	let eocd = -1;
	for (let i = tail.length - 22; i >= 0; i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
	if (eocd < 0) throw new Error(`no zip directory in ${url}`);
	let cdSize = view.getUint32(eocd + 12, true);
	let cdOffset = view.getUint32(eocd + 16, true);
	if (cdOffset === 0xffffffff) {
		// zip64: the locator sits right before the end of central directory record
		const locator = eocd - 20;
		const record = Number(view.getBigUint64(locator + 8, true)) - (size - tail.length);
		cdSize = Number(view.getBigUint64(record + 40, true));
		cdOffset = Number(view.getBigUint64(record + 48, true));
	}
	const cd = await range(url, cdOffset, cdOffset + cdSize - 1);
	const dir = new DataView(cd.buffer);
	for (let i = 0; i + 46 <= cd.length && dir.getUint32(i, true) === 0x02014b50; ) {
		const method = dir.getUint16(i + 10, true);
		let compressed = dir.getUint32(i + 20, true);
		const nameLength = dir.getUint16(i + 28, true);
		const extraLength = dir.getUint16(i + 30, true);
		const commentLength = dir.getUint16(i + 32, true);
		let local = dir.getUint32(i + 42, true);
		const name = new TextDecoder().decode(cd.subarray(i + 46, i + 46 + nameLength));
		if (name === 'AppxManifest.xml') {
			for (let e = i + 46 + nameLength; e + 4 <= i + 46 + nameLength + extraLength; ) {
				const id = dir.getUint16(e, true);
				const length = dir.getUint16(e + 2, true);
				if (id === 1) {
					let at = e + 4;
					if (dir.getUint32(i + 24, true) === 0xffffffff) at += 8;
					if (compressed === 0xffffffff) { compressed = Number(dir.getBigUint64(at, true)); at += 8; }
					if (local === 0xffffffff) local = Number(dir.getBigUint64(at, true));
				}
				e += 4 + length;
			}
			const header = await range(url, local, local + 29);
			const hv = new DataView(header.buffer);
			const start = local + 30 + hv.getUint16(26, true) + hv.getUint16(28, true);
			const data = await range(url, start, start + compressed - 1);
			const xml = new TextDecoder().decode(method === 8 ? inflateRawSync(data) : data);
			const version = /<Identity\b[^>]*\bVersion="(\d+(?:\.\d+){3})"/.exec(xml)?.[1];
			if (!version) throw new Error(`no Identity Version in ${url}`);
			return version;
		}
		i += 46 + nameLength + extraLength + commentLength;
	}
	throw new Error(`no AppxManifest.xml in ${url}`);
}

const base = 'https://cdn.kde.org/ci-builds/network/ruqola/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per stable branch (2.6/, 2.7/, ...), so both the newest branch
// and the build number in its sideload appx name have to be discovered.
// The appx identity carries the real version, which the CI file name does not.
export default defineShard(async () => {
	const branch = [...(await getText(base)).matchAll(/href="(\d+)\.(\d+)\/"/g)]
		.map(([, major, minor]) => ({ major: Number(major), minor: Number(minor), name: `${major}.${minor}` }))
		.toSorted((a, b) => b.major - a.major || b.minor - a.minor)[0];
	if (!branch) throw new Error('no Ruqola release branch found');

	const dir = `${base}${branch.name}/windows/`;
	const build = [
		...(await getText(dir)).matchAll(/href="(ruqola-[\d.]+-(\d+)-windows-cl-msvc2022-x86_64-sideload\.appx)"/g),
	]
		.map(([, file, number]) => ({ file: file!, number: Number(number) }))
		.toSorted((a, b) => b.number - a.number)[0];
	if (!build) throw new Error(`no sideload appx found in ${dir}`);

	return {
		version: await appxVersion(`${dir}${build.file}`),
		urls: () => [`${dir}${build.file}`],
	};
});
