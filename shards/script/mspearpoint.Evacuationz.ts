import { defineShard } from 'anthelion';
import { getLatestFileCommit, githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Evacuationz has no releases: each version is an MSI named Evacuationz-<major>-<minor>[-<patch>].msi
// at the root of the main branch, so the newest file is picked and pinned to its commit.
export default defineShard(async () => {
	const { data } = await githubClient.rest.repos.getContent({ owner: 'mspearpoint', repo: 'Evacuationz', path: '' });
	const files = (Array.isArray(data) ? data : []).flatMap(({ name }) => {
		const parts = /^Evacuationz-(\d+(?:-\d+)+)\.msi$/.exec(name)?.[1];
		return parts ? [{ name, version: parts.replaceAll('-', '.') }] : [];
	});
	const latest = files.sort((a, b) => compareVersions(b.version, a.version))[0];
	if (!latest) throw new Error('No Evacuationz MSI found');
	const commit = await getLatestFileCommit({ owner: 'mspearpoint', repo: 'Evacuationz', branch: 'main', path: latest.name });

	return {
		version: latest.version,
		urls: () => [`https://raw.githubusercontent.com/mspearpoint/Evacuationz/${commit}/${latest.name}`],
		releaseNotes: { releaseNotesUrl: 'https://github.com/mspearpoint/Evacuationz' },
	};
});
