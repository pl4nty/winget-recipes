import { defineShard } from 'anthelion';

// Upstream versions drop the beta suffix (156.0b2 is 156.0).
export default defineShard(async () => {
	const { FIREFOX_DEVEDITION: release } = (await fetch('https://product-details.mozilla.org/1.0/firefox_versions.json').then((response) => response.json())) as { FIREFOX_DEVEDITION: string };
	const prefix = `https://download-installer.cdn.mozilla.net/pub/devedition/releases/${release}`;
	return {
		version: release.replace(/b.+$/, ''),
		urls: () => ['win32', 'win64', 'win64-aarch64'].map((platform) => `${prefix}/${platform}/en-US/Firefox%20Setup%20${release}.exe`),
	};
});
