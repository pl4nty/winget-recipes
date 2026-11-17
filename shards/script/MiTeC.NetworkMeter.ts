import { defineShard } from 'anthelion';
import { inflateRawSync } from 'node:zlib';

// The site shows no version and the exe's ProductVersion lags (2.0.0.0 for 2.5.0),
// so read the FileVersion of NetMet.exe from the zip (the last version resource; earlier
// ones belong to embedded data) and keep upstream's three parts.
const url = 'https://www.mitec.cz/Downloads/NetMet.zip';
const exeName = 'NetMet.exe';

function readEntry(zip: Buffer, name: string): Buffer {
	const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
	if (eocd < 0) throw new Error('Not a zip file');
	let offset = zip.readUInt32LE(eocd + 16);
	for (let i = 0; i < zip.readUInt16LE(eocd + 10); i++) {
		const method = zip.readUInt16LE(offset + 10);
		const size = zip.readUInt32LE(offset + 20);
		const nameLength = zip.readUInt16LE(offset + 28);
		const extraLength = zip.readUInt16LE(offset + 30);
		const commentLength = zip.readUInt16LE(offset + 32);
		const local = zip.readUInt32LE(offset + 42);
		const entryName = zip.toString('latin1', offset + 46, offset + 46 + nameLength);
		if (entryName.split('/').at(-1)?.toLowerCase() === name.toLowerCase()) {
			const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
			const data = zip.subarray(start, start + size);
			return method === 8 ? inflateRawSync(data) : data;
		}
		offset += 46 + nameLength + extraLength + commentLength;
	}
	throw new Error(`${name} not found in ${url}`);
}

export default defineShard(async () => {
	const zip = Buffer.from(await fetch(url).then((response) => response.arrayBuffer()));
	const exe = readEntry(zip, exeName);
	const info = exe.lastIndexOf(Buffer.from([0xbd, 0x04, 0xef, 0xfe]));
	if (info < 0) throw new Error(`No version resource in ${exeName}`);
	const ms = exe.readUInt32LE(info + 8);
	const ls = exe.readUInt32LE(info + 12);
	const parts = [ms >>> 16, ms & 0xffff, ls >>> 16, ls & 0xffff];
	const version = (parts[3] === 0 ? parts.slice(0, 3) : parts).join('.');

	return {
		version,
		urls: () => [{ url, nestedInstallerMatches: [exeName] }],
	};
});
