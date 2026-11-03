import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// The vendor's nightly workflow moves the `nightly` tag to the built commit and versions the
// installer as nightly-<short sha> (`git rev-parse --short HEAD`).
export default defineShard(async () => {
	const owner = 'maforget';
	const repo = 'ComicRackCE';
	const { data: ref } = await githubClient.rest.git.getRef({ owner, repo, ref: 'tags/nightly' });
	const sha =
		ref.object.type === 'tag'
			? (await githubClient.rest.git.getTag({ owner, repo, tag_sha: ref.object.sha })).data.object.sha
			: ref.object.sha;

	return {
		version: `nightly-${sha.slice(0, 7)}`,
		urls: () => [`https://github.com/${owner}/${repo}/releases/download/nightly/ComicRackCESetup_nightly.exe`],
		replace: true,
	};
});
