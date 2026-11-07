import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Firebird 3 package versions carry the build number from the asset name (e.g. 3.0.x.NNNN); keep upstream order x64, Win32.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'FirebirdSQL',
		repo: 'firebird',
		tagRegex: '^v(?=3\\.\\d+\\.\\d+$)',
		sortByVersion: true,
		perPage: 100,
	});

	const assetRegex = /^Firebird-(\d+(?:\.\d+)+)-\d+-(x64|Win32)\.exe$/;
	const order = ['x64', 'Win32'];
	const installers = release.assets
		.map((asset) => ({ url: asset.browser_download_url, match: assetRegex.exec(asset.name) }))
		.filter((asset) => asset.match)
		.sort((a, b) => order.indexOf(a.match![2]!) - order.indexOf(b.match![2]!));
	if (installers.length !== order.length) throw new Error(`Expected ${order.length} Windows installers in ${release.rawTag}`);
	const build = installers[0]!.match![1]!;

	return {
		version: build,
		urls: () => installers.map((installer) => installer.url),
		releaseNotes: {
			source: 'github',
			owner: 'FirebirdSQL',
			repo: 'firebird',
			tag: release.rawTag,
		},
	};
});
