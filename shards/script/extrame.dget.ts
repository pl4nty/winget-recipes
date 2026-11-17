import { defineShard } from 'anthelion';

type Commit = { sha: string; commit: { committer: { date: string } } };

// dget ships its binary on the Gitee master branch; the package version is the commit date plus a counter for builds that day.
export default defineShard(async () => {
	const commits = (await fetch(
		'https://gitee.com/api/v5/repos/extrame/dget/commits?sha=master&path=bin/windows_amd64/dget.exe&per_page=100',
	).then((response) => response.json())) as Commit[];
	const day = (commit: Commit) => commit.commit.committer.date.slice(0, 10);
	const latest = commits[0];
	if (!latest) throw new Error('No dget commits found');
	const build = commits.filter((commit) => day(commit) === day(latest)).length;
	const version = `${day(latest).replaceAll('-', '.')}.${build}`;

	return {
		version,
		urls: () => [`https://gitee.com/extrame/dget/raw/${latest.sha}/bin/windows_amd64/dget.exe`],
		releaseNotes: { releaseNotesUrl: `https://gitee.com/extrame/dget/commit/${latest.sha}` },
	};
});
