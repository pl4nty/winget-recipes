import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const { url } = (await fetch('https://www.yy.com/yyweb/download/getLink?id=153').then((response) => response.json())) as { url: string };
	const {
		groups: [version],
	} = match(url, /(\d+(?:\.\d+){3,})/);
	return { version, urls: () => [url] };
});
