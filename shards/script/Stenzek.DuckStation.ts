import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// Versioned releases are tagged v0.1-<build> next to the rolling "latest" and "preview" tags,
// and winget-pkgs uses 0.1.<build> as the version.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'stenzek',
		repo: 'duckstation',
		per_page: 30,
	});
	const assets = ['duckstation-windows-x64-release.zip', 'duckstation-windows-arm64-release.zip'];
	const release = releases
		.filter(
			(release) =>
				!release.draft &&
				!release.prerelease &&
				/^v\d+\.\d+-\d+$/.test(release.tag_name) &&
				assets.every((name) => release.assets.some((asset) => asset.name === name)),
		)
		.sort((a, b) => Number(b.tag_name.split('-')[1]) - Number(a.tag_name.split('-')[1]))[0];
	if (!release) throw new Error('No versioned DuckStation release with Windows zips found');

	return {
		version: release.tag_name.replace(/^v/, '').replace('-', '.'),
		urls: () =>
			assets.map((name) => `https://github.com/stenzek/duckstation/releases/download/${release.tag_name}/${name}`),
		releaseNotes: { source: 'github', owner: 'stenzek', repo: 'duckstation', tag: release.tag_name },
	};
});
