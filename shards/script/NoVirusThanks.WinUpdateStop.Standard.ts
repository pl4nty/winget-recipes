import { defineShard } from 'anthelion';

// The "latest" download link serves the current installer without an ETag, so the change token is
// whichever validator the final response carries; the version comes from the installer's metadata.
const DOWNLOAD = 'https://downloads.winupdatestop.com/latest/winupdatestop-standard/setup';

export default defineShard(async () => {
	let url = DOWNLOAD;
	let response = await fetch(url, { redirect: 'manual' });
	const location = response.headers.get('location');
	if (location) {
		await response.body?.cancel();
		url = new URL(location, DOWNLOAD).href;
		response = await fetch(url);
	}
	if (!response.ok) throw new Error(`Win Update Stop Standard download returned HTTP ${response.status}`);
	const state =
		response.headers.get('etag') ??
		response.headers.get('last-modified') ??
		response.headers.get('content-disposition') ??
		response.headers.get('content-length');
	await response.body?.cancel();
	if (!state) throw new Error(`No change token for ${url}: ${JSON.stringify(Object.fromEntries(response.headers))}`);

	return {
		version: { source: 'display' },
		urls: () => [url],
		state,
		replace: true,
	};
});
