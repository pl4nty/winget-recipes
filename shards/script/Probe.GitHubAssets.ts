import { defineShard } from 'anthelion';

const urls = ['https://downloads.usbradar.com/latest/usbradar-standard/setup', 'https://www.usbradar.com/changelog/'];

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	for (const url of urls) {
		try {
			const response = await fetch(url);
			out[url] = { status: response.status, url: response.url, headers: Object.fromEntries(response.headers) };
			await response.body?.cancel();
		} catch (error) {
			out[url] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
