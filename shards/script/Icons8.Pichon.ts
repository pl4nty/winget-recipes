import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Icons8 publishes the current build at an unversioned PichonSetup.exe and keeps each build at PichonSetup_<major.minor.patch>.exe.
// The version comes from the ProductVersion resource of the unversioned setup, which sits in the first megabytes of the file.
const BASE = 'https://lun-static.s3.us-west-000.backblazeb2.com/pichon/setup';

export default defineShard(async () => {
	const response = await fetch(`${BASE}/PichonSetup.exe`, { headers: { Range: 'bytes=0-4194303' } });
	if (!response.ok) throw new Error(`Failed to download PichonSetup.exe: ${response.status}`);
	const state = response.headers.get('etag') ?? response.headers.get('last-modified');
	if (!state) throw new Error('No ETag or Last-Modified header found');

	const bytes = Buffer.from(await response.arrayBuffer());
	// Version resource strings are UTF-16LE but may start at an odd offset, so try both alignments.
	const text = bytes.toString('utf16le') + bytes.subarray(1).toString('utf16le');
	const version = match(text, /ProductVersion\0+(\d+(?:\.\d+){3})[ \0]/, 'No ProductVersion found in PichonSetup.exe').groups[0];
	const url = `${BASE}/PichonSetup_${version.replace(/\.0$/, '')}.exe`;

	return {
		version,
		urls: async () => {
			const head = await fetch(url, { method: 'HEAD' });
			if (!head.ok) throw new Error(`${url} returned ${head.status}`);
			return [url];
		},
		state,
	};
});
