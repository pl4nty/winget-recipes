import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://www.goanywhere.com/products/open-pgp-studio/download/thank-you', /gapgpstudio[\d_]+_windows-x64\.exe/);
	const {
		groups: [version],
	} = match(url, /gapgpstudio(\d+(?:_\d+)+)_windows/);
	return { version: version.replaceAll('_', '.'), urls: () => [url] };
});
