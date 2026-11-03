import { defineShard } from 'anthelion';
import { getLatestRelease, githubClient } from 'anthelion/github';

// Releases are tagged 5.2.1, but the package version appends the first six
// characters of the tagged commit (5.2.1-057ba4), matching the app's DisplayName.
export default defineShard(async () => {
	const owner = 'timschneeb';
	const repo = 'GalaxyBudsClient';
	const release = await getLatestRelease({ owner, repo });

	const { data: ref } = await githubClient.rest.git.getRef({ owner, repo, ref: `tags/${release.rawTag}` });
	let sha = ref.object.sha;
	if (ref.object.type === 'tag') {
		const { data: tag } = await githubClient.rest.git.getTag({ owner, repo, tag_sha: sha });
		sha = tag.object.sha;
	}

	return {
		version: `${release.version}-${sha.slice(0, 6)}`,
		urls: () => release.urls().filter((url) => url.endsWith('/GalaxyBudsClient_Windows_64bit_Setup.exe')),
		releaseNotes: {
			source: 'github',
			owner,
			repo,
			tag: release.rawTag,
		},
	};
});
