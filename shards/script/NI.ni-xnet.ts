import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// NI's driver download page lists every release oldest first, each with a
// versioned offline ISO path. Take the highest version from those paths and
// build the online installer URL, which uses only major.minor.
export default defineShard(async () => {
	const html = await fetch(
		'https://www.ni.com/en/support/downloads/drivers/download.ni-xnet.html',
	).then((response) => response.text());
	const versions = [
		...html.matchAll(
			/\/ni-xnet\/\d+\.\d+\/offline\/ni-xnet_(\d+\.\d+\.\d+)_offline\.iso/g,
		),
	].map((m) => m[1]);
	if (versions.length === 0) throw new Error('No ni-xnet version found');
	const version = versions.sort(compareVersions).at(-1)!;
	const short = version.split('.').slice(0, 2).join('.');

	return {
		version,
		urls: () => [
			`https://download.ni.com/support/nipkg/products/ni-x/ni-xnet/${short}/online/ni-xnet_${short}_online.exe`,
		],
	};
});
