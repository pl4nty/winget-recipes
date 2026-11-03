import { defineShard } from 'anthelion';

const base = 'https://mspcontrolrepo.blob.core.windows.net/virtuworksautopilot';
const series = '2.0';
const file = `Virtuworks-Autopilot-${series}.0`;

// Builds live in versioned folders (<series>.<build>/) with no index, so probe them.
async function exists(build: number) {
	const response = await fetch(`${base}/${series}.${build}/${file}.exe`, { method: 'HEAD' });
	return response.ok;
}

export default defineShard(async () => {
	let start = 0;
	for (let power = 1; power <= 1 << 14; power *= 2) {
		if (await exists(power)) start = power;
	}
	if (!start) throw new Error('No Virtuworks Autopilot build folder found');

	let latest = start;
	let misses = 0;
	for (let build = start + 1; misses < 16; build++) {
		if (await exists(build)) {
			latest = build;
			misses = 0;
		} else {
			misses++;
		}
	}

	const version = `${series}.${latest}`;
	return {
		version,
		urls: () => [
			`${base}/${version}/${file}.exe`,
			`${base}/${version}/${file}-x86.msi`,
			`${base}/${version}/${file}-x64.msi`,
		],
	};
});
