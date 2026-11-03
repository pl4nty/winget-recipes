import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// Zadig's own update feed gives the build version (e.g. 2.9.788) and the libwdi release asset.
export default defineShard(async () => {
	const feed = await ky('https://zadig.akeo.ie/Zadig_win.ver').text();
	const {
		groups: [version],
	} = match(feed, /^version = (\d+(?:\.\d+)+)\s*$/m);
	const {
		groups: [url, tag],
	} = match(
		feed,
		/^download_url = (https:\/\/github\.com\/pbatard\/libwdi\/releases\/download\/([^/]+)\/zadig-[\d.]+\.exe)\s*$/m,
	);

	return {
		version,
		urls: () => [url],
		releaseNotes: {
			source: 'github',
			owner: 'pbatard',
			repo: 'libwdi',
			tag,
		},
	};
});
