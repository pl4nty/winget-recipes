import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor reuses one release tag (`continuous_releases`) and puts the version only in the asset name.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'KorigamiK',
		repo: 'mangu',
		tag: 'continuous_releases',
	});
	const asset = release.assets.find((a) => /^ManguReader\.Setup\.\d+(?:\.\d+)*\.exe$/.test(a.name));
	if (!asset) throw new Error('No ManguReader.Setup.<version>.exe asset on the continuous_releases release');
	const version = asset.name.replace(/^ManguReader\.Setup\./, '').replace(/\.exe$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'KorigamiK', repo: 'mangu', tag: 'continuous_releases' },
	};
});
