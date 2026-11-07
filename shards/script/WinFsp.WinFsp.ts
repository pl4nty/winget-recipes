import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags are major.minor (v2.1); the package version is the full build
// number in the msi name (winfsp-2.1.25156.msi), so read it from the asset.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'winfsp', repo: 'winfsp', kind: 'stable' });
	const urls = release.urls().filter((url) => /\/winfsp-\d+(?:\.\d+)+\.msi$/i.test(url));
	if (urls.length !== 1) throw new Error('Expected exactly one winfsp msi asset');

	const {
		groups: [version],
	} = match(urls[0]!, /winfsp-(\d+(?:\.\d+)+)\.msi$/i);

	return {
		version,
		urls: () => urls,
		releaseNotes: { source: 'github', owner: 'winfsp', repo: 'winfsp', tag: release.rawTag },
	};
});
