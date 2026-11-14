import { defineShard } from 'anthelion';

const container = 'https://pcstwinget.blob.core.windows.net/pc-servicetool-images';

export default defineShard(async () => {
	const listing = await fetch(`${container}?restype=container&comp=list&prefix=RecomAppWix_`).then((response) =>
		response.text(),
	);
	const versions = [...listing.matchAll(/<Name>RecomAppWix_(\d+(?:_\d+)+)\.msi<\/Name>/g)].map((match) =>
		match[1].split('_').map(Number),
	);
	if (versions.length === 0) throw new Error('No RecomAppWix msi found in the vendor container');
	versions.sort((a, b) => {
		for (let i = 0; i < Math.max(a.length, b.length); i++) {
			const diff = (a[i] ?? 0) - (b[i] ?? 0);
			if (diff !== 0) return diff;
		}
		return 0;
	});
	const latest = versions[versions.length - 1];

	return {
		version: latest.join('.'),
		urls: () => [`${container}/RecomAppWix_${latest.join('_')}.msi`],
	};
});
