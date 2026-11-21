import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve, text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const {
		groups: [version],
	} = match(await text('https://www.wiz.cn/as/blogs/downloads-windows.html'), /最新版本：(\d+(?:\.\d+)+)/);
	const url = await resolve('https://url.wiz.cn/u/windows');
	return { version, urls: () => [url] };
});
