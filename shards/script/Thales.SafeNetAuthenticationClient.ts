import { defineShard } from 'anthelion';
import { isStateMatching, komac } from 'anthelion/helpers';
import ky from 'ky';

const packageIdentifier = 'Thales.SafeNetAuthenticationClient';
const page = 'https://knowledge.digicert.com/general-information/how-to-download-safenet-authentication-client';

// DigiCert lists the Windows SAC zips newest first and names them by release (10.9 R1 GA), not
// build, so the version comes from the nested MSI and the zip's ETag keeps unchanged runs quiet.
export default defineShard(async () => {
	const html = await ky(page).text();
	const url = /https:\/\/www\.digicert\.com\/StaticFiles\/Windows_SAC_[\w.-]+\.zip/i.exec(html)?.[0];
	if (!url) {
		throw new Error('No Windows SAC zip found');
	}

	const state = (await ky.head(url)).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	const installers = [
		{ url, architecture: 'arm64', nestedInstallerMatches: ['/Msi/arm64/'] },
		{ url, architecture: 'x86', nestedInstallerMatches: ['/Msi/x32/'] },
		{ url, architecture: 'x64', nestedInstallerMatches: ['/Msi/x64/'] },
	] as const;
	const result = { urls: () => [...installers], releaseNotes: { releaseNotesUrl: page }, state };

	// The zip is ~150 MB, so only analyse it when it has changed. Anthelion skips the update on a
	// matching state before it resolves the version.
	if (await isStateMatching({ packageIdentifier, state, ignoreQuotes: true })) {
		return { ...result, version: { source: 'product' } };
	}

	// The nested installers are MSIs, which have no PE ProductVersion, so read the MSI's ARP version.
	const { installers: analyzed } = await komac.analyzeInstaller(installers[2]);
	const displayVersion = analyzed.flatMap((installer) => installer.appsAndFeaturesEntries)[0]?.displayVersion;
	if (!displayVersion) {
		throw new Error('No MSI ProductVersion found');
	}
	const parts = displayVersion.split('.');
	const version = [...parts, ...Array(Math.max(0, 4 - parts.length)).fill('0')].join('.');

	return { ...result, version };
});
