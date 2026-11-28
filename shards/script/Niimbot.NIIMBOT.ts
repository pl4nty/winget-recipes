import { defineShard } from 'anthelion';

// The download centre is a Nuxt app: the Windows installer links are hard-coded in one of its
// hashed JavaScript chunks, so scan the chunks the page loads and take the newest x64 build.
const PAGE = 'https://www.niimbot.com/us/downloadCenter';
const INSTALLER = /https:\/\/oss\.niimbot\.com\/print\/pc\/package\/(\d+(?:\.\d+)+)\/niimbot-print_win_\1_x64[\w-]*\.exe/g;

const compare = (a: string, b: string) => {
	const x = a.split('.').map(Number);
	const y = b.split('.').map(Number);
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		const d = (x[i] ?? 0) - (y[i] ?? 0);
		if (d) return d;
	}
	return 0;
};

export default defineShard(async () => {
	const page = await fetch(PAGE).then((response) => response.text());
	const chunks = [...new Set(page.match(/\/_nuxt\/[\w.-]+\.js/g) ?? [])];
	const sources = await Promise.all(
		chunks.map((chunk) => fetch(new URL(chunk, PAGE)).then((response) => (response.ok ? response.text() : ''))),
	);
	const found = sources.flatMap((source) => [...source.matchAll(INSTALLER)].map((m) => ({ version: m[1], url: m[0] })));
	if (!found.length) throw new Error('No NIIMBOT Windows x64 installer link found');
	const latest = found.sort((a, b) => compare(b.version, a.version))[0];

	return {
		version: latest.version,
		urls: () => [latest.url],
	};
});
