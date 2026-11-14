import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const {
		groups: [link],
	} = match(await text('https://www.todesk.com/download.html'), /win_link:"([^"]*irrigation[^"]*ToDesk_[\d.]+\.exe)"/);
	const url = link.replaceAll('\\u002F', '/');
	const {
		groups: [version],
	} = match(url, /ToDesk_(\d+(?:\.\d+)+)\.exe/);
	return { version, urls: () => [url] };
});
