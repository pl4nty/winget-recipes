import { defineShard } from 'anthelion';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const [version, , url] = (await text('https://terra-1-g.djicdn.com/851d20f7b9f64838a34cd02351370894/DJI%20Terra/new_version.txt')).trim().split(/\s+/);
	return { version: version!, urls: () => [url!] };
});
