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
		.map((release) => {
			const [feature = '', build = ''] = release.tag_name.slice(4).split('+');
			// Pad the feature version (jdk-11+28 is 11.0.0) so the build number is not compared as a minor version.
			const key = [...feature.split('.'), '0', '0'].slice(0, Math.max(3, feature.split('.').length)).join('.');
			return { tag: release.tag_name, version: `${feature}.${build}`, key: `${key}.${build}` };
		})
		.sort((a, b) => compareVersions(a.key, b.key))
		.at(-1);
	if (!latest) throw new Error('No HotSpot GA release found');
	const file = `OpenJDK11U-jdk_x64_windows_hotspot_${latest.tag.slice(4).replace('+', '_')}.msi`;

	return {
		version: latest.version,
		urls: () => [`https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/${latest.tag}/${file}`],
	};
});
