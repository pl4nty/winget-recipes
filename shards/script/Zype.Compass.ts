import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import { getLatestFileCommit, githubClient } from 'anthelion/github';

// The vendor commits versioned MSIs (download/setup-<version>.msi) to the default branch instead of publishing releases.
export default defineShard(async () => {
	const owner = 'Zype-Z';
	const repo = 'Compass';
	const commit = await getLatestFileCommit({ owner, repo, path: 'download' });
	const { data } = await githubClient.rest.repos.getContent({ owner, repo, path: 'download', ref: commit });
	if (!Array.isArray(data)) throw new Error('Expected the download directory listing');
	const versions = data
		.map((entry) => /^setup-(\d+(?:\.\d+)+)\.msi$/.exec(entry.name)?.[1])
		.filter((version): version is string => version !== undefined)
		.sort(compareVersions);
	const version = versions.at(-1);
	if (!version) throw new Error('No setup-<version>.msi found in download/');

	return {
		version,
		urls: () => [`https://github.com/${owner}/${repo}/raw/${commit}/download/setup-${version}.msi`],
	};
});
