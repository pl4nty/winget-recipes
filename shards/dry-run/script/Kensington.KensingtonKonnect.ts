import { defineShard } from 'anthelion';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.kensington.com/software/kensington-konnect/', /kkbsetup\.msi/);
	return { version: { source: 'product' }, urls: () => [url] };
});
