import { defineShard } from 'anthelion';

// Companion builds live in per-series folders (2.3/, 2.4/...), so pick the newest series first, then its newest build.
const BASE = 'https://downloads.open-tx.org';

const compare = (a: string, b: string) => {
	const x = a.split('.').map(Number);
	const y = b.split('.').map(Number);
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		const d = (x[i] ?? 0) - (y[i] ?? 0);
		if (d) return d;
	}
	return 0;
};

const newest = (page: string, regex: RegExp) => {
	const found = [...page.matchAll(regex)].map((m) => m[1]!);
	if (!found.length) throw new Error(`No match for ${regex}`);
	return found.sort(compare).at(-1)!;
};

export default defineShard(async () => {
	const root = await fetch(`${BASE}/`).then((response) => response.text());
	const series = newest(root, /href="(\d+\.\d+)\/"/gi);
	const listing = await fetch(`${BASE}/${series}/release/companion/windows/`).then((response) => response.text());
	const version = newest(listing, /href="companion-windows-(\d+(?:\.\d+)+)\.exe"/gi);

	return {
		version,
		urls: () => [`${BASE}/${series}/release/companion/windows/companion-windows-${version}.exe`],
	};
});
