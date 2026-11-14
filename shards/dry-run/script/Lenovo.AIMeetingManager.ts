import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const xml = await text('https://filedownload.lenovo.com/dtsw/AIMeeting/AIMeetingManager.xml');
	const {
		groups: [url],
	} = match(xml, /<url>([^<]+)<\/url>/);
	const {
		groups: [version],
	} = match(xml, /<version>([^<]+)<\/version>/);
	return { version, urls: () => [url] };
});
