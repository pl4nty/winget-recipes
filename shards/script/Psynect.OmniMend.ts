import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's installer feed gives the version and the offline installer URL.
// Release notes come from the matching Windows entry of the changelog page
// (Mac entries are prefixed with "Mac" and skipped).
export default defineShard(async () => {
	const feed = (await fetch('https://crashpro-inference.psynect.workers.dev/releases/latest-installer.json').then((response) =>
		response.json(),
	)) as { version: string; installer_url: string };
	const { version } = feed;

	const page = 'https://omnimend.com/changelog';
	const html = await fetch(page).then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		captures: { notes },
	} = match(html, new RegExp(`<summary>\\s*<span>${escaped}</span>[\\s\\S]*?</summary>\\s*<div>(?<notes>[\\s\\S]*?)</div>\\s*</details>`));

	return {
		version,
		urls: () => [feed.installer_url],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
