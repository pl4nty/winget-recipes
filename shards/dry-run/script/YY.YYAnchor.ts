import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The YY Anchor update API needs a signing key, so use the public download link.
export default defineShard(async () => {
	const { url } = (await fetch('https://www.yy.com/yyweb/download/getLink?id=yyanchor').then((response) => response.json())) as { url: string };
	const {
		groups: [version],
	} = match(url, /(\d+(?:\.\d+){3})/);
	return { version, urls: () => [url] };
});
