import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Nightly builds are republished under the fixed `nightly` tag, so the version
// comes from the asset names (qView-nightly-Windows_64-2025-10-11.1.zip).
const assetRegex = /^qView-nightly-Windows_(32|64|arm64)-(\d{4}-\d{2}-\d{2}\.\d+)\.zip$/;
const archOrder = ['32', '64', 'arm64'];

export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'jurplel',
		repo: 'qView',
		tag: 'nightly',
	});

	const assets = release.assets
		.filter((asset) => assetRegex.test(asset.name))
		.sort(
			(a, b) =>
				archOrder.indexOf(match(a.name, assetRegex).groups[0]) -
				archOrder.indexOf(match(b.name, assetRegex).groups[0]),
		);
	if (assets.length === 0) {
		throw new Error('No Windows nightly assets found');
	}

	const build = match(assets[0]!.name, assetRegex).groups[1];
	const version = build.replaceAll('-', '.');

	return {
		version,
		urls: () =>
			assets.map((asset) => ({
				url: asset.browser_download_url,
				nestedInstallerMatches: [`qView-nightly-${build}.exe`],
			})),
		releaseNotes: {
			source: 'github',
			owner: 'jurplel',
			repo: 'qView',
			tag: 'nightly',
		},
	};
});
