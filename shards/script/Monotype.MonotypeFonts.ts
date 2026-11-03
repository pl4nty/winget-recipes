import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's install guide links the current Windows build as
// release/<build>/win/MTFInstallerWindows.zip, where the build number is the
// MSIX version without dots (781 is 7.8.1.0).
const page = 'https://support.monotype.com/en/articles/9127915-installing-monotype-desktop-app';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { build },
	} = match(html, /https:\/\/monotypeapp\.monotype\.com\/release\/(?<build>\d{3})\/win\/MTFInstallerWindows\.zip/);

	return {
		version: `${build.split('').join('.')}.0`,
		urls: () => [`https://monotypeapp.monotype.com/release/${build}/win/MTFInstallerWindows.zip`],
		replace: true,
	};
});
