import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Nightly tags look like 20261002-v1.78.2-NB-(3725) (older ones 2023.03.03-v1.77.3-nb), packaged as 1.78.2.3725.
// Recent nightlies ship only portable zips, so take the newest nightly that still has an installer msi.
const owner = 'mRemoteNG';
const repo = 'mRemoteNG';

export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 100 });
	const release = releases.find(
		(release) =>
			!release.draft &&
			/-nb\b/i.test(release.tag_name) &&
			release.assets.some((asset) => /installer.*\.msi$/i.test(asset.name)),
	);
	if (!release) throw new Error('No mRemoteNG nightly with an installer msi');
	const installers = release.assets.filter((asset) => /installer.*\.msi$/i.test(asset.name));

	const base = match(release.tag_name, /v(\d+\.\d+\.\d+)/).groups[0];
	const build =
		/\((\d+)\)/.exec(release.tag_name)?.[1] ??
		match(installers[0]!.name, /nb[-.]?(\d+)/i, `No build number in ${installers[0]!.name}`).groups[0];

	return {
		version: `${base}.${build}`,
		urls: () => installers.map((asset) => asset.browser_download_url),
		releaseNotes: { source: 'github', owner, repo, tag: release.tag_name },
	};
});
