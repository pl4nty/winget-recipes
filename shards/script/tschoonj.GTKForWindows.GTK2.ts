import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged by date and the newest ones only ship GTK3, so this takes the newest
// release that has a GTK2 runtime asset (gtk2-runtime-2.24.33-2021-01-30-ts-win64.exe) and
// reads the GTK version from the asset name.
export default defineShard(async () => {
	const owner = 'tschoonj';
	const repo = 'GTK-for-Windows-Runtime-Environment-Installer';
	const assetRegex = /^gtk2-runtime-(\d+(?:\.\d+)+)-.*-win64\.exe$/;
	const { data: releases } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 50 });
	const release = releases.find(
		(release) => !release.draft && !release.prerelease && release.assets.some((asset) => assetRegex.test(asset.name)),
	);
	if (!release) throw new Error('No release with a GTK2 runtime installer found');

	const asset = release.assets.find((asset) => assetRegex.test(asset.name))!;
	const version = match(asset.name, assetRegex).groups[0];

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner, repo, tag: release.tag_name },
	};
});
