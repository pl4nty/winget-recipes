import { defineShard } from 'anthelion';
import { getLatestFileCommit, githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// oss-winget commits each build to packages/gperf/<version>/ in its storage repo,
// so take the greatest version folder and pin its archive to the commit that last changed it.
const owner = 'oss-winget';
const repo = 'oss-winget-storage';

export default defineShard(async () => {
	const { data: folders } = await githubClient.rest.repos.getContent({ owner, repo, path: 'packages/gperf' });
	if (!Array.isArray(folders)) throw new Error('packages/gperf is not a folder');
	const version = folders
		.filter((entry) => entry.type === 'dir' && /^\d+(?:\.\d+)*$/.test(entry.name))
		.map((entry) => entry.name)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No gperf version folders found');

	const { data: files } = await githubClient.rest.repos.getContent({ owner, repo, path: `packages/gperf/${version}` });
	if (!Array.isArray(files)) throw new Error(`packages/gperf/${version} is not a folder`);
	const archive = files.find((entry) => entry.type === 'file' && entry.name.endsWith('.zip'));
	if (!archive) throw new Error(`No archive in packages/gperf/${version}`);
	const commit = await getLatestFileCommit({ owner, repo, path: archive.path });

	return {
		version,
		urls: () => [`https://github.com/${owner}/${repo}/raw/${commit}/${archive.path}`],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/${owner}/${repo}/blob/${commit}/packages/gperf/${version}/README.md`,
		},
	};
});
