import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Releases are committed as Binary Archive/UI++<version>.zip on main (no GitHub releases).
export default defineShard(async () => {
	const owner = 'jason4tw';
	const repo = 'UIPlusPlus';
	const { data: branch } = await githubClient.rest.repos.getBranch({ owner, repo, branch: 'main' });
	const commit = branch.commit.sha;
	const { data: tree } = await githubClient.rest.git.getTree({ owner, repo, tree_sha: commit, recursive: 'true' });
	const regex = /^Binary Archive\/UI\+\+(?<v>\d+(?:\.\d+)+)\.zip$/;
	const latest = tree.tree
		.flatMap((entry) => {
			const m = entry.type === 'blob' && entry.path ? regex.exec(entry.path) : null;
			return m?.groups?.v ? [{ path: entry.path as string, version: m.groups.v }] : [];
		})
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No installer found on the main branch');

	return {
		version: latest.version,
		urls: () => {
			const url = `https://github.com/${owner}/${repo}/raw/${commit}/${latest.path.replaceAll(' ', '%20')}`;
			return [
				{ url, architecture: 'x86', nestedInstallerMatches: ['x86/UI++.exe'] },
				{ url, architecture: 'x64', nestedInstallerMatches: ['x64/UI++64.exe'] },
			];
		},
	};
});
