import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged 5.0.0-beta.N but marked stable, and the package version (5.0.N) is only in
// the installer file names.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Zaarrg',
		repo: 'stremio-community-v5',
		useLatestEndpoint: true,
	});

	const installers = release.assets.filter((asset) =>
		/^Stremio\.\d+(?:\.\d+)+-x(?:64|86)\.exe$/i.test(asset.name),
	);
	const x64 = installers.find((asset) => /-x64\.exe$/i.test(asset.name));
	if (!x64) throw new Error(`No x64 installer in ${release.rawTag}`);
	const version = match(x64.name, /^Stremio\.(\d+(?:\.\d+)+)-x64\.exe$/i).groups[0];

	return {
		version,
		urls: () =>
			[x64, ...installers.filter((asset) => asset !== x64)].map(
				(asset) => asset.browser_download_url,
			),
	};
});
