import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://www.sa-mp.mp/downloads/').then((response) => response.text());
	const {
		groups: [url, release],
	} = match(page, /(https:\/\/gta-multiplayer\.cz\/downloads\/sa-mp-(0\.3\.7-R\d+(?:-\d+)?)-MP-install\.exe)/);

	return {
		// Upstream versions are lowercase, e.g. 0.3.7-r5-2 for sa-mp-0.3.7-R5-2-MP-install.exe.
		version: release!.toLowerCase(),
		urls: () => [url!],
	};
});
