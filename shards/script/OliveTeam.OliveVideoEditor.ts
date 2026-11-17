import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect, githubClient } from 'anthelion/github';

// The vendor site names each Windows build after the short hash of the release tag's commit.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'olive-editor', repo: 'olive' });
	const { data: commit } = await githubClient.rest.repos.getCommit({
		owner: 'olive-editor',
		repo: 'olive',
		ref: release.rawTag,
	});
	const hash = commit.sha.slice(0, 7);

	return {
		version: release.version,
		urls: () => [`https://olivevideoeditor.org/dl/Olive-${hash}-Windows-x86_64.exe`],
		releaseNotes: { releaseNotesUrl: `https://github.com/olive-editor/olive/releases/tag/${release.rawTag}` },
	};
});
