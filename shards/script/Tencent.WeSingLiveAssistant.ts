import { defineShard } from 'anthelion';

// kg.qq.com/index-pc.html reads its PC download links from this JSONP config
const config = 'https://y.gtimg.cn/music/common/upload/kgpcconfig/1168.js';

export default defineShard(async () => {
	const text = await fetch(config).then((response) => response.text());
	const json = text.slice(text.indexOf('(') + 1, text.lastIndexOf(')'));
	const url: string | undefined = JSON.parse(json)?.data?.data_121?.pc_zhubo_download_url;
	if (!url) throw new Error('No WeSing Live Assistant PC download URL found');

	return {
		version: { source: 'product' },
		urls: () => [url],
		state: url,
		releaseNotes: { releaseNotesUrl: 'https://kg.qq.com/index-pc.html' },
	};
});
