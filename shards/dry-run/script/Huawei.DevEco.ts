import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const html = await text('https://developer.huawei.com/consumer/cn/deveco-studio/');
	const {
		groups: [name, version, url],
	} = match(html, /(devecostudio-windows-(\d+\.\d+\.\d+\.\d+))\.zip[\s\S]*?href="([^"]+)"/);
	return { version: { source: 'display' }, urls: () => [{ url: url.replaceAll('&amp;', '&'), nestedInstallerMatches: [`${name}/deveco-studio-${version}.exe`] }] };
});
