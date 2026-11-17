import { defineShard } from 'anthelion';
import { getReleaseByTag, githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Stable releases are tagged "<version>-RELEASE" (0.H-RELEASE) among thousands of daily
// experimental tags, and the asset names carry a build timestamp instead of the version.
export default defineShard(async () => {
	const owner = 'CleverRaven';
	const repo = 'Cataclysm-DDA';
	const { data: refs } = await githubClient.rest.git.listMatchingRefs({ owner, repo, ref: 'tags/0.' });
	const version = refs
		.flatMap((ref) => /^refs\/tags\/(\d+\.[A-Z])-RELEASE$/.exec(ref.ref)?.[1] ?? [])
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No <version>-RELEASE tag found');
	const release = await getReleaseByTag({ owner, repo, tag: `${version}-RELEASE` });
	const asset = release.assets.find((a) => /^cdda-windows-with-graphics-and-sounds-x64-[\d-]+\.zip$/.test(a.name));
	if (!asset) throw new Error(`No cdda-windows-with-graphics-and-sounds-x64 asset on ${version}-RELEASE`);

	return {
		version,
		urls: () => [asset.browser_download_url],
	};
});
