import { defineShard } from 'anthelion';

// Upstream tracks the 0.14.0-preN prereleases, which the numeric sort-versions strategy cannot order,
// so the newest installer in the download directory is picked with semver precedence (x.y.z > x.y.z-preN).
const key = (version: string) => {
	const [core, pre] = version.split('-', 2) as [string, string | undefined];
	const match = pre ? /^(\D*)(\d*)$/.exec(pre) : null;
	return { core: core.split('.').map(Number), pre: pre === undefined ? undefined : [match?.[1] ?? pre, Number(match?.[2] || 0)] as const };
};
const compare = (a: string, b: string) => {
	const [x, y] = [key(a), key(b)];
	for (let i = 0; i < Math.max(x.core.length, y.core.length); i++) {
		const d = (x.core[i] ?? 0) - (y.core[i] ?? 0);
		if (d) return d;
	}
	if (!x.pre || !y.pre) return (x.pre ? -1 : 0) - (y.pre ? -1 : 0);
	return x.pre[0] === y.pre[0] ? x.pre[1] - y.pre[1] : x.pre[0] < y.pre[0] ? -1 : 1;
};

export default defineShard(async () => {
	const page = await fetch('https://bkchem.zirael.org/download/').then((response) => response.text());
	const versions = [...page.matchAll(/bkchem-(\d+(?:\.\d+)+(?:-[a-z]+\d+)?)\.exe/g)].map((m) => m[1]!);
	const version = versions.sort(compare).at(-1);
	if (!version) throw new Error('No BKChem Windows installer found in https://bkchem.zirael.org/download/');

	return {
		version,
		urls: () => [`https://bkchem.zirael.org/download/bkchem-${version}.exe`],
	};
});
