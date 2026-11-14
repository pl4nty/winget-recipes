import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://www.swi-prolog.org/download/stable/bin/swipl-latest.x64.exe');
	const {
		groups: [version],
	} = match(url, /-(\d+\.\d+\.\d+)[-.]/);
	return { version, urls: () => [url] };
});
