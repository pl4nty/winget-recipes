import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The vendor commits the portable exe to the master branch, with the version only in its file name.
export default defineShard(async () => {
	const owner = 'boan-anbo';
	const repo = 'Zotero-Citation-Picker-for-Windows';
	const { data: branch } = await githubClient.rest.repos.getBranch({ owner, repo, branch: 'master' });
	const commit = branch.commit.sha;
	const { data: tree } = await githubClient.rest.git.getTree({ owner, repo, tree_sha: commit, recursive: 'true' });
	const regex = /^ZoteroWindowsPicker_v\.(?<v>\d+(?:\.\d+)+)\.exe$/;
	const latest = tree.tree
		.flatMap((entry) => {
			const m = entry.type === 'blob' && entry.path ? regex.exec(entry.path) : null;
			return m?.groups?.v ? [{ path: entry.path as string, version: m.groups.v }] : [];
		})
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No installer found on the master branch');

	return {
		version: latest.version,
		releaseNotes: { releaseNotesUrl: `https://github.com/${owner}/${repo}#update-history` },
		urls: () => [`https://github.com/${owner}/${repo}/raw/${commit}/${latest.path.replaceAll(' ', '%20')}`],
	};
});
