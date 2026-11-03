import { defineShard } from 'anthelion';
import ky from 'ky';

const page = 'https://valentin-software.com/en/products/pvsol/';

export default defineShard(async () => {
	const html = await ky(page).text();
	const releases = [...html.matchAll(/PV\*SOL 2026 Release (\d+)/g)].map((m) => Number(m[1]));
	if (!releases.length) throw new Error('No PV*SOL 2026 release found');
	const release = Math.max(...releases);

	return {
		version: `2026.${release}`,
		urls: () => [`https://downloads.valentin.de/pvsol/setup_pvsol_2026_${release}.exe`],
		releaseNotes: { releaseNotesUrl: `${page}#release-notes` },
	};
});
