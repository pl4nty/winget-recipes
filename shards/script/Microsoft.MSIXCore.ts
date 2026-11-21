import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'microsoft', repo: 'msix-packaging', useLatestEndpoint: true });

	return {
		version: { source: 'display' },
		urls: () =>
			release.assets
				.filter(({ name }) => /^(?:msixmgr\.zip|msixmgrSetup-[\d.]+-x(?:64|86)\.msi)$/.test(name))
				.flatMap(({ name, browser_download_url: url }) =>
					name === 'msixmgr.zip'
						? (['x64', 'x86'] as const).map((architecture) => ({
								url,
								architecture,
								nestedInstallerMatches: [`${architecture}\\msixmgr.exe`],
							}))
						: [url],
				),
	};
});
