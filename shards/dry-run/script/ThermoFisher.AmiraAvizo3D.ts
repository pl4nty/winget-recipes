import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const page = 'https://www.thermofisher.com/software-em-3d-vis/customerportal/download-center/amira-avizo-3d-installers/';
	const html = await text(page);
	const {
		groups: [version],
	} = match(html, /Amira-Avizo 3D (\d+(?:\.\d+)+)/);
	const {
		groups: [href],
	} = match(html, new RegExp(`href="([^"]+/AmiraAvizo3D/${version.replaceAll('.', '\\.')}/[^"]+Windows64[^"]*\\.exe)"`), `No Windows installer for ${version}`);
	return { version, urls: () => [new URL(href, page).href] };
});
