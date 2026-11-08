import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://download.iflynote.com/voicenote_pc_win');
	const {
		groups: [version],
	} = match(url, /-(\d+\.\d+\.\d+)[-.]/);
	return { version, urls: () => [url] };
});
