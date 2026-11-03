import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The vendor republishes every build under the fixed `snapshot` release tag, so
// the version comes from the installer asset name instead of the tag:
// GitTools_<yyyy.m.d>.<version>.exe. If older assets stay on the release, the
// highest version wins.
export default defineShard(async () => {
	const release = await getReleaseByTag({ owner: 'yyqh01', repo: 'git', tag: 'snapshot' });
	const assets = release.assets
		.map((asset) => ({
			url: asset.browser_download_url,
			version: /^GitTools_\d{4}\.\d{1,2}\.\d{1,2}\.(\d+(?:\.\d+)*)\.exe$/i.exec(asset.name)?.[1],
		}))
		.filter((asset): asset is { url: string; version: string } => asset.version !== undefined)
		.sort((a, b) => compareVersions(b.version, a.version));
	const latest = assets[0];
	if (!latest) {
		throw new Error('No GitTools installer found on the snapshot release');
	}

	return {
		version: latest.version,
		urls: () => [latest.url],
		releaseNotes: { source: 'github', owner: 'yyqh01', repo: 'git', tag: 'snapshot' },
	};
});
