import { defineShard } from 'anthelion';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://www.mersive.com/files/41694/');
	return { version: { source: 'product' }, urls: () => [url] };
});
