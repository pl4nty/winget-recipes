import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://help.uprightlabs.com/en-us/lister/how-to-install-lister-connect-on-windows', /lister-connect-[\d.]+-x86_64\.exe/);
	const {
		groups: [version],
	} = match(url, /lister-connect-(\d+(?:\.\d+)+)-/);
	return { version, urls: () => [url] };
});
