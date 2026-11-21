import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags are named by year (winlame-2024-release-1); the version is only in the MSI asset name.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'vividos', repo: 'winLAME', useLatestEndpoint: true });
	const asset = release.assets.find((a) => /^winLAME-Setup-\d+(?:\.\d+)+\.msi$/.test(a.name));
	if (!asset) throw new Error(`No winLAME-Setup-<version>.msi asset on ${release.rawTag}`);
	const version = asset.name.replace(/^winLAME-Setup-/, '').replace(/\.msi$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'vividos', repo: 'winLAME', tag: release.rawTag },
	};
});
