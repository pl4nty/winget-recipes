import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Each release replaces the repository's single <version>/ folder, so the installer URL is
// pinned to the commit that last touched that folder (a branch URL 404s after the next release).
const owner = 'Aida-Enna';
const repo = 'PSO2TweakerReleases';

export default defineShard(async () => {
	const { data: entries } = await githubClient.rest.repos.getContent({ owner, repo, path: '' });
	if (!Array.isArray(entries)) throw new Error('Unexpected repository contents');
	const version = entries
		.filter((entry) => entry.type === 'dir' && /^\d+(?:\.\d+)+$/.test(entry.name))
		.map((entry) => entry.name)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No PSO2 Tweaker version folder found');

	const { data: commits } = await githubClient.rest.repos.listCommits({ owner, repo, path: version, per_page: 1 });
	const sha = commits[0]?.sha;
	if (!sha) throw new Error(`No commit found for ${version}`);

	return {
		version,
		urls: () => [{ url: `https://github.com/${owner}/${repo}/raw/${sha}/${version}/PSO2%20Tweaker.exe`, architecture: 'x64' }],
	};
});
