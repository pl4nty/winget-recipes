import { defineShard } from 'anthelion';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.sysinfotools.com/mbox-exporter.php', /\.exe/);
	return { version: { source: 'product' }, urls: () => [url] };
});
