import { defineShard } from 'anthelion';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.crucial.com/support/storage-executive.html', /storage-executive-win[^"']*-64-[^"']*\.zip/);
	return { version: { source: 'product' }, urls: () => [{ url, nestedInstallerMatches: ['storage-executive-win'] }] };
});
