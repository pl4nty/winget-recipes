import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Serverless v4 (sf-core@4.x releases) ships no Windows binary; serverless-win-x64.exe
// is published only on the v3 release line, whose tags drop out of the release list.
export default defineShard(async () => {
	const { data } = await githubClient.rest.git.listMatchingRefs({ owner: 'serverless', repo: 'serverless', ref: 'tags/v3.' });
	const versions = data
		.map(({ ref }) => ref.replace(/^refs\/tags\/v/, ''))
		.filter((version) => /^\d+\.\d+\.\d+$/.test(version))
		.sort(compareVersions);
	const version = versions.at(-1);
	if (!version) throw new Error('No Serverless v3 release tag found');

	return {
		version,
		urls: () => [`https://github.com/serverless/serverless/releases/download/v${version}/serverless-win-x64.exe`],
		releaseNotes: { source: 'github', owner: 'serverless', repo: 'serverless', tag: `v${version}` },
	};
});
