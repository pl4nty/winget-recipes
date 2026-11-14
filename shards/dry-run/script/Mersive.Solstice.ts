import { defineShard } from 'anthelion';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://www.mersive.com/files/41701/');
	return { version: { source: 'product' }, urls: () => [url] };
});
