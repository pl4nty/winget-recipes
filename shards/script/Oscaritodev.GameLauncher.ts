import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags drop the dot (GameLauncher30 for 3.0), so read the version from the MSI name.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'Oscaritodev', repo: 'GameLauncher' });
	const asset = release.assets.find((a) => /^GameLauncher-\d+(?:\.\d+)*-win64\.msi$/.test(a.name));
	if (!asset) throw new Error(`No GameLauncher-<version>-win64.msi asset on ${release.rawTag}`);
	const version = asset.name.replace(/^GameLauncher-/, '').replace(/-win64\.msi$/, '');

	return {
		version,
		urls: () => [{ url: asset.browser_download_url, architecture: 'x64' }],
	};
});
