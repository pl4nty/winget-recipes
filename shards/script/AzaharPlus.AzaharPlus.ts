import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags (AZAHAR_PLUS_2126_1_B) can carry an Android-only respin letter, so the
// version comes from the Windows asset name (azaharplus-2126.1-A-windows.zip) instead.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'AzaharPlus', repo: 'AzaharPlus' });
	const asset = release.assets.find((a) => /^azaharplus-\d+(?:\.\d+)*-[A-Z]-windows\.zip$/.test(a.name));
	if (!asset) throw new Error(`No azaharplus-<version>-windows.zip asset on ${release.rawTag}`);
	const version = asset.name.replace(/^azaharplus-/, '').replace(/-windows\.zip$/, '');

	return {
		version,
		urls: () => [{ url: asset.browser_download_url, nestedInstallerMatches: ['azahar.exe'] }],
		releaseNotes: { source: 'github', owner: 'AzaharPlus', repo: 'AzaharPlus', tag: release.rawTag },
	};
});
