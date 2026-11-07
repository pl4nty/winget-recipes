import { defineShard } from 'anthelion';

const urls = ['https://downloads.usbradar.com/latest/usbradar-standard/setup'];

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	for (const url of urls) {
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
			console.log('PROBE-HEADERS', response.status, response.url, JSON.stringify(Object.fromEntries(response.headers)));
			out[url] = response.status;
		} catch (error) {
			out[url] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
