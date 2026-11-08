import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://www.adinstruments.com/support/downloads/windows/glp-client').then((response) => response.text());
	const {
		groups: [link],
	} = match(page, /href="([^"]+\.msi)"/i, 'No .msi link found');
	const { url } = await fetch(new URL(link, 'https://www.adinstruments.com/'), { method: 'HEAD' });
	return { version: { source: 'display' }, urls: () => [url] };
});
