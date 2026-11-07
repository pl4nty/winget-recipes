import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// The binaries live unversioned in the repository wiki, so the ETag of the x64 build tracks
// changes, and the version is the date of the latest commit to the source repository.
const base = 'https://raw.githubusercontent.com/wiki/mmozeiko/wcap';

export default defineShard(async () => {
	const response = await fetch(`${base}/wcap-x64.exe`, { method: 'HEAD' });
	const state = response.headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	const { data } = await githubClient.rest.repos.listCommits({ owner: 'mmozeiko', repo: 'wcap', per_page: 1 });
	const date = data[0]?.commit.committer?.date;
	if (!date) {
		throw new Error('No commit date found');
	}
	const version = date.slice(0, 10).replaceAll('-', '.');

	return {
		version,
		urls: () => [`${base}/wcap-x64.exe`, `${base}/wcap-arm64.exe`],
		state,
	};
});
