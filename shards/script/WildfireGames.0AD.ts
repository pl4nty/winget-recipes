import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The release index lists every build; the announcement post slug is only discoverable from the news feed.
export default defineShard(async () => {
	const index = await fetch('https://releases.wildfiregames.com/').then((response) => response.text());
	const versions = [...index.matchAll(/href="0ad-(\d+\.\d+\.\d+)-win64\.exe"/g)].map((m) => m[1]!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No 0 A.D. Windows release found');

	const [, minor, patch] = version.split('.');
	const feed = await fetch('https://play0ad.com/feed/').then((response) => response.text());
	const post =
		patch === '0'
			? new RegExp(`<link>(https://play0ad\\.com/new-release-[^<]*-(?:release|alpha)-${minor}-[^<]*)</link>`)
			: new RegExp(`<link>(https://play0ad\\.com/[^<]*release-${minor}-${patch}[^<]*)</link>`);
	const releaseNotesUrl = post.exec(feed)?.[1] ?? 'https://play0ad.com/news/';

	return {
		version,
		urls: () => [
			`https://releases.wildfiregames.com/0ad-${version}-win64.exe`,
			`https://releases.wildfiregames.com/0ad-${version}-win32.exe`,
		],
		releaseNotes: { releaseNotesUrl },
	};
});
