import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// winget-pkgs files OpenJDK 8u<update>-<release>.b<build> as 1.8.<update><release>.<build>
// (java-1.8.0-openjdk-1.8.0.332-1.b09 is 1.8.3321.9). The x86 MSI has its own "-x86" release.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'ojdkbuild',
		repo: 'ojdkbuild',
		per_page: 50,
	});
	for (const release of releases) {
		const tag = /^java-1\.8\.0-openjdk-1\.8\.0\.(?<update>\d+)-(?<rel>\d+)\.b(?<build>\d+)$/.exec(release.tag_name);
		if (!tag?.groups || release.draft || release.prerelease) continue;
		const x64 = release.assets.find((a) => a.name === `${release.tag_name}.ojdkbuild.windows.x86_64.msi`);
		if (!x64) continue;
		const { update, rel, build } = tag.groups;
		const x86Tag = `${release.tag_name}-x86`;
		return {
			version: `1.8.${update}${rel}.${Number(build)}`,
			urls: () => [
				{ url: x64.browser_download_url, architecture: 'x64' },
				{
					url: `https://github.com/ojdkbuild/ojdkbuild/releases/download/${x86Tag}/${release.tag_name}.ojdkbuild.windows.x86.msi`,
					architecture: 'x86',
				},
			],
		};
	}
	throw new Error('No ojdkbuild OpenJDK 8 x86_64 MSI found in recent releases');
});
