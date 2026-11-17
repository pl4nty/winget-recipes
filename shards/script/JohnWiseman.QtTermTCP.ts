import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { inflateRawSync } from 'node:zlib';

// The vendor ships only an unversioned zip and the exe's version resource is 0.0.0.0, so the version comes from the string embedded in the exe.
// Only the 32-bit zip is still linked from the product page; QtTermTCP64.zip is a stale 2022 build.
const URL = 'https://www.cantab.net/users/john.wiseman/Downloads/QtTermTCP.zip';
const ENTRY = 'Release/QtTermTCP.exe';

function readEntry(zip: Buffer, name: string): Buffer {
	const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
	if (eocd < 0) throw new Error('No zip central directory found');
	let offset = zip.readUInt32LE(eocd + 16);
	const entries = zip.readUInt16LE(eocd + 10);
	for (let index = 0; index < entries; index++) {
		const method = zip.readUInt16LE(offset + 10);
		const compressedSize = zip.readUInt32LE(offset + 20);
		const nameLength = zip.readUInt16LE(offset + 28);
		const extraLength = zip.readUInt16LE(offset + 30);
		const commentLength = zip.readUInt16LE(offset + 32);
		const localOffset = zip.readUInt32LE(offset + 42);
		if (zip.toString('utf8', offset + 46, offset + 46 + nameLength) === name) {
			const dataStart = localOffset + 30 + zip.readUInt16LE(localOffset + 26) + zip.readUInt16LE(localOffset + 28);
			const data = zip.subarray(dataStart, dataStart + compressedSize);
			return method === 0 ? data : inflateRawSync(data);
		}
		offset += 46 + nameLength + extraLength + commentLength;
	}
	throw new Error(`${name} is missing from the archive`);
}

export default defineShard(async () => {
	const response = await fetch(URL);
	if (!response.ok) throw new Error(`Failed to download ${URL}: ${response.status}`);
	const state = response.headers.get('etag') ?? response.headers.get('last-modified');
	if (!state) throw new Error('No ETag or Last-Modified header found');

	const exe = readEntry(Buffer.from(await response.arrayBuffer()), ENTRY);
	const version = match(exe.toString('latin1'), /\b(0\.0\.0\.\d+)\b/, 'No version string found in QtTermTCP.exe').groups[0];

	return {
		version,
		urls: () => [URL],
		state,
	};
});
