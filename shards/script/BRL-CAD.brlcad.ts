import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// Tags are rel-X-Y-Z and the Windows installer is sometimes uploaded after the
// release is published, so take the newest stable release that has it.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'BRL-CAD',
		repo: 'brlcad',
		per_page: 25,
	});

	for (const release of releases) {
		if (release.draft || release.prerelease || !/^rel-\d+(?:-\d+)+$/.test(release.tag_name)) continue;
		const asset = release.assets.find((asset) => /^BRL-CAD_\d+(?:\.\d+)+_win64\.exe$/.test(asset.name));
		if (!asset) continue;
		const msi = release.assets.find((asset) => /^BRL-CAD_\d+(?:\.\d+)+_win64\.msi$/.test(asset.name));

		return {
			version: release.tag_name.replace(/^rel-/, '').replaceAll('-', '.'),
			urls: () => [asset.browser_download_url, ...(msi ? [msi.browser_download_url] : [])],
			releaseNotes: { source: 'github', owner: 'BRL-CAD', repo: 'brlcad', tag: release.tag_name },
		};
	}

	throw new Error('No BRL-CAD release with a win64 installer found');
});
