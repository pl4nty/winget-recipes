import { defineShard } from 'anthelion';

const site = 'https://simulide.com/p/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// The downloads page links one page per 1.x series (download110 = 1.1.0); that page's CFG map
// names the current service release (SimulIDE_1.1.0-SR2_Win64.zip) served from basePath.
// SR0 keeps the plain series version used upstream (1.1.0); later service releases become 1.1.0.N
export default defineShard(async () => {
	const series = [...(await getText(`${site}downloads/`)).matchAll(/href="https:\/\/simulide\.com\/p\/download(1\d\d)\/"/g)]
		.map(([, code]) => code)
		.toSorted((a, b) => Number(b) - Number(a))[0];
	if (!series) throw new Error('no SimulIDE 1.x download page found');

	const page = await getText(`${site}download${series}/`);
	const basePath = page.match(/"basePath":"([^"]+)"/)?.[1]?.replaceAll('\\/', '/');
	const match = page.match(/"simulide1":\{[^}]*"Windows 64":"SimulIDE_(\d+\.\d+\.\d+)-SR(\d+)_Win64\.zip"/);
	if (!basePath || !match) throw new Error(`no SimulIDE Windows build found on download${series}`);
	const [, base, sr] = match;
	const file = `SimulIDE_${base}-SR${sr}`;

	return {
		version: sr === '0' ? base : `${base}.${sr}`,
		urls: () => [`${basePath}${file}_Win64.zip`, `${basePath}${file}_Win32.zip`],
	};
});
