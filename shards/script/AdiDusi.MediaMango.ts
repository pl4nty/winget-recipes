import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor reuses one release tag (`Release`) and puts the version only in the asset name.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'CSASD',
		repo: 'mediamango-downloads',
		tag: 'Release',
	});
	const asset = release.assets.find((a) => /^MediaMango_\d+(?:\.\d+)+_x64-setup\.exe\.zip$/.test(a.name));
	if (!asset) throw new Error('No MediaMango_<version>_x64-setup.exe.zip asset on the Release release');
	const version = asset.name.replace(/^MediaMango_/, '').replace(/_x64-setup\.exe\.zip$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
	};
});
