import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned, so read the build from the vendor's update feed.
// Its newest item's change list becomes the release notes, passed as a data: URL.
const feed = 'https://www.electronic.us/rss/en-usb-over-ethernet.rss';

export default defineShard(async () => {
	const rss = await fetch(feed).then((response) => response.text());
	const {
		groups: [, notes],
		captures: { version },
	} = match(rss, /<item>[\s\S]*?<b>Build: (?<version>\d+(?:\.\d+)+)<\/b>[\s\S]*?(<ul>[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => ['https://cdn.electronic.us/products/usb-over-ethernet/windows/download/usb_network_gate.exe'],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: feed,
			cleanup: false,
		},
		replace: true,
	};
});
