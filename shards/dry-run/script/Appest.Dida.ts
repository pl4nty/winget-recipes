import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const urls = await Promise.all(['win', 'win64'].map((type) => resolve(`https://www.dida365.com/static/getApp/download?type=${type}`)));
	const {
		groups: [digits],
	} = match(urls[1], /_(\d{4})\.exe$/);
	return { version: digits.split('').join('.'), urls: () => urls };
});
