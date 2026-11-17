import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The archived repository lists releases by creation date, and jdk-11.0.9.1+1 was published after jdk-11.0.11+9,
// so the newest HotSpot GA tag has to be picked by version.
export default defineShard(async () => {
	const releases = await githubClient.paginate(githubClient.rest.repos.listReleases, {
		owner: 'AdoptOpenJDK',
		repo: 'openjdk11-binaries',
		per_page: 100,
	});
	const latest = releases
		.filter((release) => !release.draft && !release.prerelease && /^jdk-\d+(?:\.\d+)*\+\d+$/.test(release.tag_name))
		.map((release) => ({ tag: release.tag_name, version: release.tag_name.slice(4).replace('+', '.') }))
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No HotSpot GA release found');
	const file = `OpenJDK11U-jdk_x64_windows_hotspot_${latest.tag.slice(4).replace('+', '_')}.msi`;

	return {
		version: latest.version,
		urls: () => [`https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/${latest.tag}/${file}`],
	};
});
