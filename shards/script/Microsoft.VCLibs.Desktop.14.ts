import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

import { appxVersion, download } from '../../lib/appx';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'winget-cli',
		useLatestEndpoint: true,
		assetRegex: '^DesktopAppInstaller_Dependencies\\.zip$',
	});
	const [url] = release.urls();

	return {
		version: appxVersion(await download(url!), /^x64\/Microsoft\.VCLibs\.140\.00\.UWPDesktop_[\d.]+_x64\.appx$/),
		urls: () =>
			(['x64', 'x86', 'arm64'] as const).map((architecture) => ({
				url: url!,
				architecture,
				nestedInstallerMatches: [`${architecture}/Microsoft.VCLibs.140.00.UWPDesktop_`],
			})),
	};
});
