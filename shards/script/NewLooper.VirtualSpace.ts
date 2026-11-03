import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are Build-<major>.<minor>.<build>; the package version (with the revision)
// is only in the asset name, e.g. VirtualSpace-1.1.1786.374-Full.msi.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'newlooper',
		repo: 'VirtualSpace',
		useLatestEndpoint: true,
	});

	const asset = release.assets.find((asset) => /^VirtualSpace-\d+(?:\.\d+)+-Full\.msi$/.test(asset.name));
	if (!asset) throw new Error('No VirtualSpace-<version>-Full.msi asset in the latest release');
	const version = asset.name.replace(/^VirtualSpace-/, '').replace(/-Full\.msi$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: {
			source: 'github',
			owner: 'newlooper',
			repo: 'VirtualSpace',
			tag: release.rawTag,
		},
	};
});
