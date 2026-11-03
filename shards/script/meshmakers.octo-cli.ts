import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// meshmakers tags releases as r<major>.<minor>.<patch> on GitHub, but the
// Windows zip is published to their Azure blob as <tag>.0, and not every tag
// gets a blob. Take the newest tag whose zip exists.
const blob = (version: string) =>
	`https://meshdownload.blob.core.windows.net/staging/octo-cli/octo-cli-${version}-win-x64.zip`;

export default defineShard(async () => {
	const response = await fetch('https://api.github.com/repos/meshmakers/octo-cli/tags?per_page=100', {
		headers: {
			Accept: 'application/vnd.github+json',
			...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
		},
	});
	if (!response.ok) throw new Error(`Failed to list meshmakers/octo-cli tags: ${response.status}`);
	const tags: { name: string }[] = await response.json();

	const versions = tags
		.map((tag) => /^r(\d+\.\d+\.\d+)$/.exec(tag.name)?.[1])
		.filter((version): version is string => !!version)
		.map((version) => `${version}.0`)
		.sort((a, b) => compareVersions(b, a));

	for (const version of versions.slice(0, 15)) {
		const head = await fetch(blob(version), { method: 'HEAD' });
		if (head.ok) return { version, urls: () => [blob(version)] };
	}
	throw new Error('No meshmakers/octo-cli tag has a Windows zip on meshdownload');
});
