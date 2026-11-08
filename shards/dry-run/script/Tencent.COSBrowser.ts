import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const prefix = 'https://cos5.cloud.tencent.com/cosbrowser/';
	const yaml = await text(`${prefix}latest.yml`);
	const {
		groups: [version],
	} = match(yaml, /^version:\s*['"]?([^'"\s]+)/m);
	const {
		groups: [file],
	} = match(yaml, /-\s*url:\s*['"]?([^'"\s]+)/);
	return { version, urls: () => [new URL(file, prefix).href.replace('dldir1.qq.com', 'dldir1v6.qq.com')] };
});
