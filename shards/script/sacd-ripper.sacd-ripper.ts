import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// One release carries several builds (sacd_extract-0.3.9.3-99-win64.zip, ...-107-win64.zip);
// winget-pkgs files the newest build as <version>-<build>.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'sacd-ripper', repo: 'sacd-ripper' });
	const builds = release.assets
		.map((asset) => ({ asset, match: /^sacd_extract-(?<version>\d+(?:\.\d+)*-\d+)-win64\.zip$/.exec(asset.name) }))
		.filter((build) => build.match?.groups?.version)
		.map(({ asset, match }) => ({ asset, version: match!.groups!.version! }));
	const latest = builds.sort((a, b) => compareVersions(a.version.replace('-', '.'), b.version.replace('-', '.'))).at(-1);
	if (!latest) throw new Error(`No sacd_extract-<version>-<build>-win64.zip asset on ${release.rawTag}`);

	return {
		version: latest.version,
		urls: () => [{ url: latest.asset.browser_download_url, architecture: 'x64' }],
	};
});
