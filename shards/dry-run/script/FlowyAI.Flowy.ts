import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const prefix = 'https://download.flowygpt.cn/flowy/';
	const yaml = await text(`${prefix}beta.yml`);
	const {
		groups: [version],
	} = match(yaml, /^version:\s*(\S+)/m);
	const {
		groups: [file],
	} = match(yaml, /-\s*url:\s*(\S+)/);
	return { version, urls: () => [new URL(file, prefix).href] };
});
