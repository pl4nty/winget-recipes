import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.dev47apps.com/droidcam/windows/', /DroidCam\.Setup\.[\d.]+\.exe/);
	const {
		groups: [version],
	} = match(url, /Setup\.(\d+(?:\.\d+)+)\.exe/);
	return { version, urls: () => [url] };
});
