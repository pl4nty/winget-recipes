import { defineShard } from 'anthelion';

const pages: Record<string, [string, RequestInit?]> = {
	veecad: ['https://veecad.com/downloads.html'],
	veecadHome: ['https://veecad.com/'],
	omnissa: ['https://customerconnect.omnissa.com/channel/public/api/v1.0/products/getRelatedDLGList?locale=en_US&category=security_and_compliance&product=omnissa_workspace_one_tunnel&version=1_0&dlgType=PRODUCT_BINARY', { headers: { 'User-Agent': 'Mozilla/5.0' } }],
	rpm: ['https://starkrats.de/x86_64_avx-linux/toolbox.x86_64_avx.rpm', { headers: { Range: 'bytes=0-95' } }],
};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	await Promise.all(
		Object.entries(pages).map(async ([id, [url, init]]) => {
			try {
				const response = await fetch(url, init);
				const text = await response.text();
				out[id] = { status: response.status, url: response.url, length: text.length, links: [...text.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 200), head: text.slice(0, 1500) };
			} catch (error) {
				out[id] = String(error);
			}
		}),
	);
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
