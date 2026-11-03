import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// Not every release ships a Windows installer, so take the newest stable release that does.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'stuntrally',
		repo: 'stuntrally3',
		per_page: 20,
	});
	const stable = releases.filter((release) => !release.draft && !release.prerelease);
	console.log(`Newest release ${stable[0]?.tag_name} assets: ${stable[0]?.assets.map((asset) => asset.name).join(', ')}`);
	for (const release of stable) {
		const installer = release.assets.find((asset) => /installer.*\.exe$/i.test(asset.name));
		if (installer) {
			return {
				version: release.tag_name.replace(/^v/, ''),
				urls: () => [installer.browser_download_url],
				releaseNotes: { source: 'github', tag: release.tag_name },
			};
		}
	}
	throw new Error('No release with a Windows installer found');
});
