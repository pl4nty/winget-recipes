import { defineShard } from 'anthelion';

// The Community Edition ships hotfixes (hfN) as uploads linked from the GitLab
// release notes of the latest non-ESR release; PackageVersion is <release>.<hotfix>.
export default defineShard(async () => {
	const releases = (await (
		await fetch('https://gitlab.com/api/v4/projects/19504919/releases?per_page=20')
	).json()) as { tag_name: string; description: string; _links: { self: string } }[];
	const release = releases.find((r) => /^\d+(?:\.\d+)+_CommunityEdition$/.test(r.tag_name));
	if (!release) throw new Error('No WSUS Offline Update CE release found');
	const base = release.tag_name.replace('_CommunityEdition', '');
	const compact = base.replaceAll('.', '');

	const uploads = [
		...release.description.matchAll(/\/uploads\/([0-9a-f]{32})\/wsusofflineCE(\d+)(?:hf(\d+))?\.zip/g),
	]
		.filter((m) => m[2] === compact)
		.map((m) => ({ hash: m[1], file: m[0].split('/').pop()!, hotfix: Number(m[3] ?? 0) }))
		.sort((a, b) => b.hotfix - a.hotfix);
	const latest = uploads[0];
	if (!latest) throw new Error(`No wsusofflineCE${compact} upload found in ${release.tag_name}`);

	return {
		version: latest.hotfix ? `${base}.${latest.hotfix}` : base,
		urls: () => [
			{
				url: `https://gitlab.com/-/project/19504919/uploads/${latest.hash}/${latest.file}`,
				nestedInstallerMatches: ['UpdateGenerator.exe'],
			},
		],
		releaseNotes: {
			releaseNotesUrl: `https://gitlab.com/wsusoffline/wsusoffline/-/releases/${release.tag_name}`,
		},
	};
});
