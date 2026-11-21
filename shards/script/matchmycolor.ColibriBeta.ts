import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The vendor publishes no listing or feed for Colibri betas. Datacolor's
// download page links the newest stable build, and betas sit on the same CDN as
// Colibri_<next>-beta.<n>.exe (older betas are removed). This takes the newest
// stable from the page and probes the next patch, the patch after it and the
// next minor for beta builds. Upstream versions the beta as <next>.<n>.
const page = 'https://www.datacolor.com/business-solutions/customer-support/colibri-software-downloads/';
const url = (base: string, beta: number) =>
	`https://cdn.matchmycolor.com/colibri/${base}/Colibri_${base}-beta.${beta}.exe`;
const maxBeta = 150;

const exists = async (target: string) => {
	try {
		const response = await fetch(target, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
};

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const stable = [...html.matchAll(/cdn\.matchmycolor\.com\/colibri\/(\d+\.\d+\.\d+)\/Colibri_/g)]
		.map((m) => m[1])
		.sort(compareVersions)
		.at(-1);
	if (!stable) throw new Error('No stable Colibri build found');
	const [major, minor, patch] = stable.split('.').map(Number);
	const bases = [`${major}.${minor}.${patch + 1}`, `${major}.${minor}.${patch + 2}`, `${major}.${minor + 1}.0`];

	const candidates = bases.flatMap((base) =>
		Array.from({ length: maxBeta }, (_, i) => ({ base, beta: i + 1 })),
	);
	const found = (
		await Promise.all(
			candidates.map(async (candidate) => ((await exists(url(candidate.base, candidate.beta))) ? candidate : undefined)),
		)
	).filter((candidate) => candidate !== undefined);
	if (found.length === 0) throw new Error(`No Colibri beta found after ${stable}`);
	const latest = found
		.map((candidate) => ({ ...candidate!, version: `${candidate!.base}.${candidate!.beta}` }))
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1)!;

	return {
		version: latest.version,
		urls: () => [url(latest.base, latest.beta)],
	};
});
