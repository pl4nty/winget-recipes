import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const feed = await fetch('https://www.softanics.com/armdot/changelog/rss.xml').then((response) =>
		response.text(),
	);
	const {
		groups: [release],
	} = match(feed, /<item>\s*<title><!\[CDATA\[ArmDot (\d+(?:\.\d+)+)\]\]><\/title>/);
	const parts = release!.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => [`https://www.softanics.com/download/armdot/windows/armdot-${version}-setup.exe`],
		releaseNotes: {
			releaseNotesUrl: 'https://www.softanics.com/armdot/changelog',
		},
	};
});
