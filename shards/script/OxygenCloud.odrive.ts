import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const response = await fetch('https://www.odrive.com/downloaddesktop?platform=win', {
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const {
		groups: [build],
	} = match(location, /\/odrivesync\.(\d+)\.exe$/);

	return {
		version: `1.0.${build}`,
		urls: () => [location],
	};
});
