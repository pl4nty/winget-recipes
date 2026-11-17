import { defineShard } from 'anthelion';
import { komac } from 'anthelion/config';
import { isStateMatching } from 'anthelion/helpers';
import ky from 'ky';

const url =
	'https://trials.adobe.com/AdobeProducts/APRO/Acrobat_HelpX/win32/Acrobat_2020_Web_WWMUI.zip';
const installer = { url, nestedInstallerMatches: ['Adobe Acrobat/Setup.exe'] };

export default defineShard(async () => {
	const state = (await ky.head(url, { timeout: 60_000, retry: 3 })).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	// The zip is ~870MB, so only analyse it when it has changed
	if (
		await isStateMatching({ packageIdentifier: 'Adobe.Acrobat.Pro.2020', state, ignoreQuotes: true })
	) {
		return { version: { source: 'product' }, urls: () => [installer], state };
	}

	// Setup.exe reports 20.5.30636.10636; winget-pkgs uses Adobe's 20.005.30636 format
	const { versions } = await komac.analyzeInstaller(installer);
	const match = versions.product?.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!match) {
		throw new Error(`Unexpected ProductVersion: ${versions.product}`);
	}
	const [, major, minor, build] = match;

	return {
		version: `${major}.${minor!.padStart(3, '0')}.${build}`,
		urls: () => [installer],
		state,
	};
});
