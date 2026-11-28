import { defineShard } from 'anthelion';
import { text } from '../lib/fetch.ts';

const pages = ['en', 'cn'].map((region) => `https://consumer.huawei.com/${region}/support/hisuite/`);
const downloads = /href="(https:\/\/consumer-tkb\.huawei\.com\/weknow\/servlet\/download\/public\?contextNo=\w+)"/g;

export default defineShard(async () => {
	const [global, china] = await Promise.all(pages.map((page) => text(page)));
	// The global page lists the Windows download first, with its version shortly after.
	const version = /V(\d+(?:\.\d+){3})\b/.exec(global!)?.[1];
	if (!version) throw new Error('No version on the global page');
	const urls = [global!, china!].map((html, index) => {
		const url = [...html.matchAll(downloads)].find((link) => html.slice(link.index, link.index + 1500).includes(`V${version}`))?.[1];
		if (!url) throw new Error(`No ${version} download on ${pages[index]}`);
		return url;
	});
	return { version, urls: () => urls };
});
