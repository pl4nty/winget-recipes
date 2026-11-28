import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The vendor commits installers to releases/download/ on the tray_icon branch (no GitHub releases).
export default defineShard(async () => {
	const owner = 'alexeikmun';
	const repo = 'Clipped';
	const { data: branch } = await githubClient.rest.repos.getBranch({ owner, repo, branch: 'tray_icon' });
	const commit = branch.commit.sha;
	const { data: tree } = await githubClient.rest.git.getTree({ owner, repo, tree_sha: commit, recursive: 'true' });
	const regex = /^releases\/download\/clipped_(?<v>\d+(?:\.\d+)+)_x64-setup\.exe$/;
	const latest = tree.tree
		.flatMap((entry) => {
			const m = entry.type === 'blob' && entry.path ? regex.exec(entry.path) : null;
			return m?.groups?.v ? [{ path: entry.path as string, version: m.groups.v }] : [];
		})
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No installer found on the tray_icon branch');

	return {
		version: latest.version,
		urls: () => [`https://github.com/${owner}/${repo}/raw/${commit}/${latest.path.replaceAll(' ', '%20')}`],
	};
});
