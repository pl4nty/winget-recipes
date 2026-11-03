import { constants, inflateRawSync } from 'node:zlib';

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

const url = 'https://downloads.wdc.com/wdapp/wd_kitfox.zip';

// WD publishes Kitfox at a fixed URL. The zip's first entry is a readme.txt
// carrying "version: x.y.z.w", so a short range request is enough to read it
// without downloading the 100 MB installer.
export default defineShard(async () => {
	const response = await ky(url, { headers: { range: 'bytes=0-2047' } });
	const zip = Buffer.from(await response.arrayBuffer());
	if (zip.readUInt32LE(0) !== 0x04034b50) {
		throw new Error('Unexpected zip local file header');
	}
	const method = zip.readUInt16LE(8);
	const dataStart = 30 + zip.readUInt16LE(26) + zip.readUInt16LE(28);
	const data = zip.subarray(dataStart);
	// The entry uses a data descriptor, so its size is unknown up front; inflate what we have.
	const raw =
		method === 8 ? inflateRawSync(data, { finishFlush: constants.Z_SYNC_FLUSH }) : data;

	const version = match(raw.toString('utf8'), /version:\s*(\d+(?:\.\d+)+)/i).groups[0];

	return { version, urls: () => [url] };
});
