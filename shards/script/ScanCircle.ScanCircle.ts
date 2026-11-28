import { createHash } from 'node:crypto';
import { defineShard } from 'anthelion';

// The portable scanner is served by an unversioned PHP endpoint without ETag, Last-Modified or
// Content-Length, so the (small, ~240 KB) file's hash is the state and the version comes from the exe.
const url = 'https://www.scancircle.com/en/scanner/portable/www';

export default defineShard(async () => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`ScanCircle download returned ${response.status}`);
	const hash = createHash('sha256')
		.update(Buffer.from(await response.arrayBuffer()))
		.digest('hex');

	return {
		version: { source: 'product' },
		state: hash,
		urls: () => [url],
		replace: true,
	};
});
