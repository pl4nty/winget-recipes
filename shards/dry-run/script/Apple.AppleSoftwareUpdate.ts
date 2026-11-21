import { defineShard } from 'anthelion';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const catalog = await text('https://swcatalog.apple.com/content/catalogs/others/index-windows-1.sucatalog');
	const url = catalog.match(/http:\/\/[^<]+\/AppleSoftwareUpdate\.msi/g)?.at(-1);
	if (!url) throw new Error('No AppleSoftwareUpdate.msi in the catalog');
	return { version: { source: 'product' }, urls: () => [url.replace(/^http:/, 'https:')] };
});
