import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The download page redirects to an unversioned setup under a CMS media folder
// (/media/<id>/driverfusionfreesetup.exe) that can change with each upload, so
// read the current link from the page, take the version from the exe and track
// the file's ETag.
const page = 'https://treexy.com/products/driver-fusion/download/';

export default defineShard(async () => {
	const html = await ky(page).text();
	const path = match(html, /URL=(\/media\/[^"'\s>]+\/driverfusionfreesetup\.exe)/i).groups[0];
	const url = new URL(path, page).href;

	const state = (await ky.head(url)).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	return {
		version: { source: 'product' },
		urls: () => [url],
		state,
		replace: true,
	};
});
