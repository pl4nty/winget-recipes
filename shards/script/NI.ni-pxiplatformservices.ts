import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// NI's driver download page lists every release oldest first, each with a
// versioned offline ISO path. Take the highest version from those paths and
// build the online installer URL, which uses only major.minor.
export default defineShard(async () => {
	const html = await fetch('https://www.ni.com/en/support/downloads/drivers/download.pxi-platform-services.html').then((response) =>
		response.text(),
	);
	const versions = [
		...html.matchAll(/\/ni-pxiplatformservices\/\d+\.\d+\/offline\/ni-pxiplatformservices_(\d+\.\d+\.\d+)_offline\.iso/g),
	].map((m) => m[1]);
	if (versions.length === 0) throw new Error('No ni-pxiplatformservices version found');
	const version = versions.sort(compareVersions).at(-1)!;
	const short = version.split('.').slice(0, 2).join('.');

	return {
		version,
		urls: () => [
			`https://download.ni.com/support/nipkg/products/ni-p/ni-pxiplatformservices/${short}/online/ni-pxiplatformservices_${short}_online.exe`,
		],
	};
});
