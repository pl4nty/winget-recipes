import { defineShard } from 'anthelion';

// The official site's Windows button redirects to a time-stamped CDN URL, and the installer exposes its version only in its metadata.
const DOWNLOAD = 'https://vda-global.lilisi.com/dl_pc/com.lilithgames.rok.pc.int/ff5a7e4128320b4b392ab0f84ab433ca';

export default defineShard(async () => {
	const response = await fetch(DOWNLOAD, { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location');
	if (!location) throw new Error(`No Rise of Kingdoms installer redirect (HTTP ${response.status})`);
	const url = new URL(location, DOWNLOAD).href;
	const installer = await fetch(url, { method: 'HEAD' });
	const state = installer.headers.get('etag') ?? installer.headers.get('last-modified');
	if (!state) throw new Error(`No change token for ${url}`);

	return {
		version: { source: 'product' },
		urls: () => [url],
		state,
		replace: true,
	};
});
