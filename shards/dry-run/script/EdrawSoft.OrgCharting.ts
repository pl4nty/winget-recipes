import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const xml = await text('http://platform.wondershare.com/rest/v2/downloader/runtime/?product_id=5373&wae=');
	const {
		groups: [major, minor],
	} = match(xml, /<version><!\[CDATA\[(\d+)\.(\d+)/);
	const {
		groups: [url],
	} = match(xml, /<download_url><!\[CDATA\[([^\]]+)\]\]>/);
	return { version: `${major}.${minor}`, urls: () => [url.replace(/^http:/, 'https:')] };
});
