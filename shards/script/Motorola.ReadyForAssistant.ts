import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Motorola's download link redirects to the current Lenovo-hosted setup. Its
// file name carries the build as one digit run (904003000 for 9.0.4.003.000),
// which is split into the dotted version upstream uses.
export default defineShard(async () => {
	const response = await fetch('https://help.motorola.com/hc/apps/readyfor/rdp/index.php?os=win', { redirect: 'manual' });
	const url = response.headers.get('location') ?? '';
	const {
		groups: [major, minor, patch, build, revision],
	} = match(url, /SmartConnect_setup_(\d)(\d)(\d)(\d{3})(\d{3})\.exe$/);

	return {
		version: [major, minor, patch, build, revision].join('.'),
		urls: () => [url],
	};
});
