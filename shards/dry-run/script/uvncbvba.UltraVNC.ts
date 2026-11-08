import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const list = 'https://uvnc.com/downloads/ultravnc.html';
	const {
		groups: [href, version],
	} = match(await text(list), /<a href="([^"]+)"[^>]*>\s*UltraVNC (\d+(?:\.\d+){3})(?![^<]*dev)/);
	const page = new URL(href, list).href;
	const html = await text(page);
	const download = async (bits: string) => {
		const {
			groups: [path],
		} = match(html, new RegExp(`${version.replaceAll('.', '\\.')}[^<]*${bits}[\\s\\S]*?href="([^"]+)"`));
		return match(await text(new URL(path.replaceAll('&amp;', '&'), page)), /document\.location\.href='([^']+?)'/).groups[0];
	};
	const urls = await Promise.all([download('x86'), download('x64')]);
	return { version, urls: () => urls };
});
