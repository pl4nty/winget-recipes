import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page posts a form to get the installer links, so read the current release from the page and post it per platform.
export default defineShard(async () => {
	const page = await fetch('https://www.altova.com/licenseserver/download').then((response) => response.text());
	const {
		captures: { release },
	} = match(page, /action="\/LS-ThankYou">[\s\S]*?name="Release" value="(?<release>\d+)"/, 'No LicenseServer release on the download page');

	const installer = async (system: string, suffix: string) => {
		const body = new URLSearchParams({
			FromArchive: 'true',
			ProductCode: 'LS',
			EditionCode: 'Z',
			Release: release,
			InstallerType: 'Product',
			OperatingSystem: system,
			Lang: 'multi',
		});
		const html = await fetch('https://www.altova.com/LS-ThankYou', { method: 'POST', body }).then((response) => response.text());
		const regex = new RegExp(`(?<url>https://cdn\\.sw\\.altova\\.com/v${release}/multi-lingual/LicenseServer(?<version>3\\.\\d+)${suffix}\\.exe)`);
		const {
			captures: { url, version },
		} = match(html, regex, `No LicenseServer ${system} installer for release ${release}`);
		return { url, version };
	};
	const [x86, x64] = await Promise.all([installer('win32', ''), installer('win64', '_x64')]);
	if (x86.version !== x64.version) throw new Error(`LicenseServer versions differ: ${x86.version} and ${x64.version}`);

	return {
		version: x64.version,
		urls: () => [x86.url, x64.url],
		releaseNotes: { releaseNotesUrl: 'https://www.altova.com/whatsnew' },
	};
});
