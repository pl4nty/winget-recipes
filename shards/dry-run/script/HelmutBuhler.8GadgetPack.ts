import { defineShard } from 'anthelion';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://gadgetpack.net/', /\/GadgetPackSetup\.msi/);
	return { version: { source: 'product' }, urls: () => [url] };
});
