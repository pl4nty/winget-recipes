import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch(
		'https://www.datacolor.com/business-solutions/customer-support/colibri-software-downloads/',
		{
			headers: { 'user-agent': 'Mozilla/5.0' },
		},
	).then((response) => response.text());
	const builds = [
		...page.matchAll(/cdn\.matchmycolor\.com\/colibri\/(\d+\.\d+\.\d+)\/Colibri_\1-alpha\.(\d+)\.exe/g),
	].map(([, base, build]) => ({
		base: base!,
		build: build!,
		version: `${base}.${build}`,
	}));
	const latest = builds.sort((a, b) => compareVersions(b.version, a.version))[0];
	if (!latest) throw new Error('No Colibri alpha build found on the Datacolor downloads page');

	return {
		version: latest.version,
		urls: () => [
			{
				url: `https://cdn.matchmycolor.com/colibri/${latest.base}/Colibri_${latest.base}-alpha.${latest.build}.exe`,
				architecture: 'x86',
			},
		],
	};
});
