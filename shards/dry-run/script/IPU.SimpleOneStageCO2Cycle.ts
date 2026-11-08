import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.ipu.dk/products/co2-cycles-application/', /simpleonestage-\d+\.exe/i);
	const {
		groups: [major, minor],
	} = match(url, /simpleonestage-(\d)(\d+)\.exe/i);
	return { version: `${major}.${minor}`, urls: () => [url] };
});
