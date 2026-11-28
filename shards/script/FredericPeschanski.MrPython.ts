import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Installers are committed to the win-installer branch as mrpython_<x_y_z[beta]>_install_FR.exe.
export default defineShard(async () => {
	const owner = 'nohtyprm';
	const repo = 'MrPython';
	const { data: branch } = await githubClient.rest.repos.getBranch({ owner, repo, branch: 'win-installer' });
	const commit = branch.commit.sha;
	const { data: tree } = await githubClient.rest.git.getTree({ owner, repo, tree_sha: commit, recursive: 'true' });
	const regex = /^mrpython_(?<v>\d+(?:_\d+)+[a-z]*)_install_FR\.exe$/;
	const latest = tree.tree
		.flatMap((entry) => {
			const m = entry.type === 'blob' && entry.path ? regex.exec(entry.path) : null;
			return m?.groups?.v ? [{ path: entry.path as string, version: m.groups.v.replaceAll('_', '.') }] : [];
		})
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No installer found on the win-installer branch');

	return {
		version: latest.version,
		urls: () => [`https://github.com/${owner}/${repo}/raw/${commit}/${latest.path.replaceAll(' ', '%20')}`],
	};
});
