import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links an older build (PhotolabQcInstaller<build>.msi), and newer builds are
// published next to it before the page is updated, so probe the following build numbers.
export default defineShard(async () => {
	const page = await fetch('https://photolabqc.com/').then((response) => response.text());
	const {
		groups: [linked],
	} = match(page, /PhotoLabQc\.com\/download\/PhotolabQcInstaller(\d+)\.msi/i);
	const exists = async (build: number) =>
		(await fetch(`https://PhotoLabQc.com/download/PhotolabQcInstaller${build}.msi`, { method: 'HEAD' })).ok;

	let build = Number(linked);
	if (!(await exists(build))) throw new Error(`PhotolabQcInstaller${build}.msi is not available`);
	for (let misses = 0, next = build + 1; misses < 3; next++) {
		if (await exists(next)) {
			build = next;
			misses = 0;
		} else misses++;
	}

	return {
		version: { source: 'display' },
		state: String(build),
		urls: () => [`https://PhotoLabQc.com/download/PhotolabQcInstaller${build}.msi`],
	};
});
