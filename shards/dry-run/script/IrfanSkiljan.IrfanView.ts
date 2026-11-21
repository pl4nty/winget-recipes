import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const {
		groups: [shown],
	} = match(await text('https://www.irfanview.com/checkversion.php'), /<b>\s*(\d+\.\d+)\s*<\/b>/);
	const version = shown.padEnd(4, '0');
	const short = version.replace('.', '');
	return { version, urls: () => [`https://files02.tchspt.com/down/iview${short}_setup.exe`, `https://files02.tchspt.com/down/iview${short}_x64_setup.exe`] };
});
