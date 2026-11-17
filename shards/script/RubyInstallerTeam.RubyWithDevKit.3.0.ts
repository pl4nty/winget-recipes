import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// RubyInstaller publishes every Ruby series from one repository, so pick the greatest
// 3.0.x release (tags like RubyInstaller-3.0.7-1, which the JSON strategies can't sort).
export default defineShard(async () => {
	const releases = await githubClient.rest.repos.listReleases({ owner: 'oneclick', repo: 'rubyinstaller2', per_page: 100 });
	const versions = releases.data
		.filter((release) => !release.draft && !release.prerelease)
		.map((release) => /^RubyInstaller-(3\.0\.\d+-\d+)$/i.exec(release.tag_name)?.[1])
		.filter((version): version is string => version !== undefined);
	const version = versions.sort((a, b) => compareVersions(a.replace('-', '.'), b.replace('-', '.'))).at(-1);
	if (!version) throw new Error('No RubyInstaller 3.0.x release found');
	const base = `https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-${version}`;

	return {
		version,
		urls: () => [`${base}/rubyinstaller-devkit-${version}-x86.exe`, `${base}/rubyinstaller-devkit-${version}-x64.exe`],
	};
});
