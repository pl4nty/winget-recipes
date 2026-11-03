import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Firebird 5 package versions are the plain tag (5.0.4); keep upstream order x86, x64.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'FirebirdSQL',
		repo: 'firebird',
		tagRegex: '^v(?=5\\.\\d+\\.\\d+$)',
		sortByVersion: true,
		perPage: 100,
	});

	const assetRegex = /^Firebird-(\d+(?:\.\d+)+)-\d+-windows-(x86|x64)\.exe$/;
	const order = ['x86', 'x64'];
	const installers = release.assets
		.map((asset) => ({ url: asset.browser_download_url, match: assetRegex.exec(asset.name) }))
		.filter((asset) => asset.match)
		.sort((a, b) => order.indexOf(a.match![2]!) - order.indexOf(b.match![2]!));
	if (installers.length !== order.length) throw new Error(`Expected ${order.length} Windows installers in ${release.rawTag}`);

	return {
		version: release.version,
		urls: () => installers.map((installer) => installer.url),
		releaseNotes: {
			source: 'github',
			owner: 'FirebirdSQL',
			repo: 'firebird',
			tag: release.rawTag,
		},
	};
});
