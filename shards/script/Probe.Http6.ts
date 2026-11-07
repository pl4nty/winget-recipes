import { defineShard } from 'anthelion';

const urls = [
	'https://tapatch.com/tools.json',
	'https://tapatch.com/tools/autrix/',
	'https://tapatch.com/downloads/Autrix-Setup-1.0.8.exe',
	'https://www.preveil.com/install-latest-release/',
	'https://www.preveil.com/blog/product-updates/',
	'https://www.preveil.com/download/',
	'https://www.preveil.com/downloads/',
];

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	for (const url of urls) {
		try {
			const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
			const text = await response.text();
			const links = [...new Set([...text.matchAll(/https?:\/\/[^"'\s<>]*(?:\.msi|\.exe|pv-bin-storage[^"'\s<>]*|download[^"'\s<>]*)/gi)].map((m) => m[0]))].slice(0, 40);
			out[url] = { status: response.status, final: response.url, server: response.headers.get('server'), len: text.length, head: text.slice(0, 300), links, h2: [...text.matchAll(/<h2[^>]*>([^<]{0,80})/g)].map((m) => m[1]).slice(0, 8) };
		} catch (error) {
			out[url] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
