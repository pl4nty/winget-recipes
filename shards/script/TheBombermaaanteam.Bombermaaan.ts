import { defineShard } from 'anthelion';
import { sourceforge } from 'anthelion/strategies';

// Stable setups live in a "1 - Bombermaaan Stable/<major.minor>/" folder, which a URL template can't derive.
export default defineShard(async () => {
	const { version } = await sourceforge({ project: 'bombermaaan', file: 'Bombermaaan_{version}_setup.exe' });
	const folder = version.split('.').slice(0, 2).join('.');

	return {
		version,
		urls: () => [
			`https://sourceforge.net/projects/bombermaaan/files/1%20-%20Bombermaaan%20Stable/${folder}/Bombermaaan_${version}_setup.exe/download`,
		],
	};
});
