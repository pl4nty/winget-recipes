import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link, text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const ini = await text('https://www.hex-rays.com/cgi-bin/oracle.cgi?prod0=IDAFRENW&ver0=0.0.0&prod1=IDAFRECW&ver1=0.0.0&prod2=IDAFREFW&ver2=0.0.0&vercheck=1');
	const {
		groups: [version],
	} = match(ini, /\[IDAFRE\][^[]*?\bver=(\d+\.\d+)/);
	const url = await link('https://hex-rays.com/ida-free/', /ida[^"']*free[^"']*windows[^"']*\.exe/i);
	return { version, urls: () => [url] };
});
