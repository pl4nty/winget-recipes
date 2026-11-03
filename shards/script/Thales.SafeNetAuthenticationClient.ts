import { defineShard } from 'anthelion';
import ky from 'ky';

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

	return {
		version: { source: 'product' },
		urls: () => [
			{ url, architecture: 'arm64', nestedInstallerMatches: ['/Msi/arm64/'] },
			{ url, architecture: 'x86', nestedInstallerMatches: ['/Msi/x32/'] },
			{ url, architecture: 'x64', nestedInstallerMatches: ['/Msi/x64/'] },
		],
		releaseNotes: { releaseNotesUrl: page },
		state,
	};
});
