import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// winget-pkgs files Wings 3D under four-part versions (2.4.1 is 2.4.1.0), so pad the release.
export default defineShard(async () => {
	const feed = await ky('https://sourceforge.net/projects/wings/rss?path=/wings', {
		timeout: 60_000,
		retry: 3,
	}).text();

	const releases = [...feed.matchAll(/\/wings\/(\d+(?:\.\d+)+)\/wings-x64-\1\.exe/g)].map(([, release]) => release!);
	const release = releases.sort(compareVersions).at(-1);
	if (!release) {
		throw new Error('No Wings 3D x64 installer found');
	}
	const parts = release.split('.');
	const version = [...parts, ...Array(Math.max(0, 4 - parts.length)).fill('0')].join('.');

	return {
		version,
		urls: () => [
			`https://sourceforge.net/projects/wings/files/wings/${release}/wings-${release}.exe`,
			`https://sourceforge.net/projects/wings/files/wings/${release}/wings-x64-${release}.exe`,
		],
	};
});
