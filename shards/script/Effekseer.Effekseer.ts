import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags are bare digits (1808 for 1.80.8), so read the version from the Windows zip's name.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'effekseer', repo: 'Effekseer' });
	const asset = release.assets.find((a) => /^Effekseer\d+(?:\.\d+)+Win\.zip$/.test(a.name));
	if (!asset) throw new Error(`No Effekseer<version>Win.zip asset on ${release.rawTag}`);
	const version = asset.name.replace(/^Effekseer/, '').replace(/Win\.zip$/, '');

	return {
		version,
		urls: () => [{ url: asset.browser_download_url, architecture: 'x64' }],
		releaseNotes: { source: 'github', owner: 'effekseer', repo: 'Effekseer', tag: release.rawTag, cleanup: false },
	};
});
