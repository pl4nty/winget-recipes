import { inflateRawSync } from 'node:zlib';
import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// KDE CI publishes the sideload AppX under one directory per release branch (release-YY.MM);
// the newest branch's newest build is used. The file name only carries the CI build number,
// so the package version (YY.MMPP.build.0) is read from the AppX's AppxManifest.xml with
// HTTP range requests instead of downloading the whole package.
const base = 'https://origin.cdn.kde.org/ci-builds/multimedia/kasts';

async function range(url: string, start: number, end: number): Promise<Buffer> {
	const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
	if (response.status !== 206) throw new Error(`Range request failed (${response.status}): ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

async function appxVersion(url: string): Promise<string> {
	const head = await fetch(url, { method: 'HEAD' });
	const size = Number(head.headers.get('content-length'));
	if (!size) throw new Error(`No content-length for ${url}`);
	const tail = await range(url, Math.max(0, size - 65_536), size - 1);
	const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
	if (eocd < 0) throw new Error('No zip end of central directory record');
	let cdSize = tail.readUInt32LE(eocd + 12);
	let cdOffset = tail.readUInt32LE(eocd + 16);
	if (cdOffset === 0xffffffff || cdSize === 0xffffffff) {
		const locator = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x06, 0x07]));
		const zip64 = Number(tail.readBigUInt64LE(locator + 8));
		const record = await range(url, zip64, zip64 + 55);
		cdSize = Number(record.readBigUInt64LE(40));
		cdOffset = Number(record.readBigUInt64LE(48));
	}
	const cd = await range(url, cdOffset, cdOffset + cdSize - 1);
	for (let p = 0; p + 46 <= cd.length; ) {
		const method = cd.readUInt16LE(p + 10);
		let compressed = cd.readUInt32LE(p + 20);
		const nameLength = cd.readUInt16LE(p + 28);
		const extraLength = cd.readUInt16LE(p + 30);
		const commentLength = cd.readUInt16LE(p + 32);
		let local = cd.readUInt32LE(p + 42);
		const name = cd.toString('utf8', p + 46, p + 46 + nameLength);
		if (name === 'AppxManifest.xml') {
			// zip64 extra field: uncompressed, compressed, local header offset (only those set to 0xffffffff)
			const extra = cd.subarray(p + 46 + nameLength, p + 46 + nameLength + extraLength);
			for (let e = 0; e + 4 <= extra.length; e += 4 + extra.readUInt16LE(e + 2)) {
				if (extra.readUInt16LE(e) !== 1) continue;
				let q = e + 4;
				if (cd.readUInt32LE(p + 24) === 0xffffffff) q += 8;
				if (compressed === 0xffffffff) (compressed = Number(extra.readBigUInt64LE(q))), (q += 8);
				if (local === 0xffffffff) local = Number(extra.readBigUInt64LE(q));
			}
			const header = await range(url, local, local + 29);
			const dataStart = local + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
			const data = await range(url, dataStart, dataStart + compressed - 1);
			const xml = (method === 8 ? inflateRawSync(data) : data).toString('utf8');
			const version = xml.match(/<Identity\b[^>]*\bVersion="(\d+(?:\.\d+){3})"/)?.[1];
			if (!version) throw new Error('No Identity Version in AppxManifest.xml');
			return version;
		}
		p += 46 + nameLength + extraLength + commentLength;
	}
	throw new Error('AppxManifest.xml not found in AppX');
}

export default defineShard(async () => {
	const branches = [...(await fetch(`${base}/`).then((r) => r.text())).matchAll(/href="release-(\d+\.\d+)\/"/g)]
		.map((m) => m[1] as string)
		.sort(compareVersions);
	const branch = branches.at(-1);
	if (!branch) throw new Error('No Kasts release branch found');
	const listing = await fetch(`${base}/release-${branch}/windows/`).then((r) => r.text());
	const regex = new RegExp(`kasts-release_${branch.replace('.', '\\.')}-(\\d+)-windows-cl-msvc2022-x86_64-sideload\\.appx"`, 'g');
	const build = [...listing.matchAll(regex)]
		.map((m) => m[1] as string)
		.sort(compareVersions)
		.at(-1);
	if (!build) throw new Error(`No Kasts sideload AppX in release-${branch}`);
	const url = `${base}/release-${branch}/windows/kasts-release_${branch}-${build}-windows-cl-msvc2022-x86_64-sideload.appx`;

	return {
		version: await appxVersion(url),
		state: `${branch}-${build}`,
		urls: () => [url],
	};
});
