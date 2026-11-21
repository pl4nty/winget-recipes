import { defineShard } from 'anthelion';

// dget has no releases: the Windows binary is committed to the Gitee repo. winget-pkgs versions it
// by commit date plus the commit's number on that day (2024.07.13.1), pinned to the commit's raw URL.
type Commit = { sha: string; commit: { committer: { date: string } } };

export default defineShard(async () => {
	const commits: Commit[] = await fetch(
		'https://gitee.com/api/v5/repos/extrame/dget/commits?path=bin/windows_amd64/dget.exe&per_page=20',
	).then((response) => response.json());
	const latest = commits[0];
	if (!latest) throw new Error('No commits found for bin/windows_amd64/dget.exe');
	const day = latest.commit.committer.date.slice(0, 10);
	const count = commits.filter((c) => c.commit.committer.date.slice(0, 10) === day).length;

	return {
		version: `${day.replaceAll('-', '.')}.${count}`,
		urls: () => [
			{ url: `https://gitee.com/extrame/dget/raw/${latest.sha}/bin/windows_amd64/dget.exe`, architecture: 'x64' },
		],
	};
});
