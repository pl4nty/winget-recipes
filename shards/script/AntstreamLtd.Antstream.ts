import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page is a single-page app: the installer link is in its hashed JavaScript bundle.
// winget-pkgs files the three-part installer version with a fourth part (2.1.2744 is 2.1.2744.0).
export default defineShard(async () => {
	const page = await fetch('https://www.antstream.com/download').then((response) => response.text());
	const {
		captures: { bundle },
	} = match(page, /src="(?<bundle>\/assets\/index-[\w-]+\.js)"/);
	const script = await fetch(new URL(bundle!, 'https://www.antstream.com/')).then((response) => response.text());
	const {
		captures: { release },
	} = match(script, /https:\/\/downloads\.antstream\.com\/antstreamInstaller-(?<release>\d+\.\d+\.\d+)\.exe/);

	return {
		version: `${release}.0`,
		urls: () => [`https://downloads.antstream.com/antstreamInstaller-${release}.exe`],
	};
});
