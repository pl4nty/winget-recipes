import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

type Params = { ntDownloadUrl: string; ntDownloadX64Url: string; ntDownloadARMUrl: string };

export default defineShard(async () => {
	const {
		groups: [config],
	} = match(await text('https://im.qq.com/pcqq/index.shtml'), /rainbowConfigUrl\s*=\s*"(.+?)"/);
	const {
		groups: [json],
	} = match(await text(`https:${config}`), /var params\s*=\s*(\{[\s\S]*?\});/);
	const params = JSON.parse(json) as Params;
	const urls = [params.ntDownloadUrl, params.ntDownloadX64Url, params.ntDownloadARMUrl].map((url) => url.replace('dldir1.qq.com', 'dldir1v6.qq.com'));
	const versions = new Set(urls.map((url) => match(url, /(\d+\.\d+\.\d+[_-]\d+)/).groups[0].replace(/[_-]/, '.')));
	if (versions.size > 1) throw new Error(`Inconsistent versions: ${[...versions].join(', ')}`);
	return { version: [...versions][0]!, urls: () => urls };
});
