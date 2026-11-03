import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// NI's driver download page lists every release oldest first, each with a
// versioned offline ISO path. Take the highest version from those paths and
// build the online installer URL, which uses only major.minor.
export default defineShard(async () => {
	const html = await fetch(
		'https://www.ni.com/en/support/downloads/drivers/download.ni-daqmx.html',
	).then((response) => response.text());
	const versions = [
		...html.matchAll(
			/\/ni-daqmx\/\d+\.\d+\/offline\/ni-daqmx_(\d+\.\d+\.\d+)_offline\.iso/g,
		),
	].map((m) => m[1]);
	if (versions.length === 0) throw new Error('No ni-daqmx version found');
	const version = versions.sort(compareVersions).at(-1)!;
	const short = version.split('.').slice(0, 2).join('.');

	return {
		version,
		urls: () => [
			`https://download.ni.com/support/nipkg/products/ni-d/ni-daqmx/${short}/online/ni-daqmx_${short}_online.exe`,
		],
	};
});
