import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const page = 'https://icecatbrowser.org/all_downloads.html';
	const [x64, arm64] = await Promise.all([link(page, /en-US\.win64\.installer\.exe/), link(page, /en-US\.win64-aarch64\.installer\.exe/)]);
	const {
		groups: [version],
	} = match(x64, /icecat-(\d+(?:\.\d+)+)\./);
	return { version, urls: () => [x64, arm64] };
});
