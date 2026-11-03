import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The zip on the wiki is unversioned; winget-pkgs versions it by date (2025-08-25),
// so the version is the date of the latest commit on master.
export default defineShard(async () => {
	const feed = await fetch('https://github.com/mmozeiko/TwitchNotify/commits/master.atom').then((response) =>
		response.text(),
	);
	const {
		groups: [version],
	} = match(feed, /<entry>[\s\S]*?<updated>(\d{4}-\d{2}-\d{2})T/);

	return {
		version,
		urls: () => ['https://raw.githubusercontent.com/wiki/mmozeiko/TwitchNotify/TwitchNotify.zip'],
	};
});
