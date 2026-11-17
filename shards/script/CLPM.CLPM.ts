import { defineShard } from 'anthelion';

// Upstream tracks release candidates (0.4.2-rc.2), which the numeric sort-versions strategy cannot order,
// so the newest build in the directory listing is picked with semver precedence (x.y.z > x.y.z-rc.N).
const parse = (version: string) => {
	const [core, pre] = version.split('-', 2) as [string, string | undefined];
	return { core: core.split('.').map(Number), pre: pre?.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part)) };
};
const compare = (a: string, b: string) => {
	const [x, y] = [parse(a), parse(b)];
	for (let i = 0; i < Math.max(x.core.length, y.core.length); i++) {
		const d = (x.core[i] ?? 0) - (y.core[i] ?? 0);
		if (d) return d;
	}
	if (!x.pre || !y.pre) return (x.pre ? -1 : 0) - (y.pre ? -1 : 0);
	for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
		const [p, q] = [x.pre[i], y.pre[i]];
		if (p === undefined || q === undefined) return p === undefined ? -1 : 1;
		if (p !== q) return typeof p === 'number' && typeof q === 'number' ? p - q : String(p) < String(q) ? -1 : 1;
	}
	return 0;
};

export default defineShard(async () => {
	const page = await fetch('https://files.clpm.dev/clpm/').then((response) => response.text());
	const versions = [...page.matchAll(/clpm-(\d+(?:\.\d+)+(?:-[a-z]+\.\d+)?)-windows-amd64\.zip/g)].map((m) => m[1]!);
	const version = versions.sort(compare).at(-1);
	if (!version) throw new Error('No CLPM Windows build found in https://files.clpm.dev/clpm/');

	return {
		version,
		urls: () => [
			{
				url: `https://files.clpm.dev/clpm/clpm-${version}-windows-amd64.zip`,
				nestedInstallerMatches: [`clpm-${version}-windows-amd64/bin/clpm.exe`],
			},
		],
	};
});
