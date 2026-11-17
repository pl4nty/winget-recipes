import { defineShard } from 'anthelion';

// The API marks more than one build as latest, so the greatest version wins.
// Versions look like 25.0.5+11 or 25.0.5.0.3+5: compare every number, the build after + last.
const parts = (version: string) => version.split(/[.+]/).map(Number);
const compare = (a: string, b: string) => {
	const [x, y] = [a, b].map(parts);
	const [xb, yb] = [x.pop()!, y.pop()!];
	for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
	return xb - yb;
};

export default defineShard(async () => {
	const releases = (await fetch(
		'https://api.bell-sw.com/v1/liberica/releases?version-feature=25&os=windows&package-type=msi&bundle-type=jre&bitness=64',
	).then((response) => response.json())) as { version: string; GA: boolean }[];
	const version = releases
		.filter((release) => release.GA)
		.map((release) => release.version)
		.sort(compare)
		.at(-1);
	if (!version) throw new Error('No Liberica JRE 25 release found');
	const url = (arch: string) => `https://download.bell-sw.com/java/${version}/bellsoft-jre${version}-windows-${arch}.msi`;

	return {
		version,
		urls: () => [url('amd64'), url('aarch64')],
	};
});
