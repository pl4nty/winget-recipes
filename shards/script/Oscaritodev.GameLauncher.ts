import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags drop the dot (`GameLauncher30` for 3.0), so the version comes from the MSI asset name.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Oscaritodev',
		repo: 'GameLauncher',
		useLatestEndpoint: true,
	});
	const asset = release.assets.find((a) => /^GameLauncher-\d+(?:\.\d+)+-win64\.msi$/i.test(a.name));
	if (!asset) throw new Error('No GameLauncher-<version>-win64.msi asset on the latest release');
	const version = asset.name.replace(/^GameLauncher-/i, '').replace(/-win64\.msi$/i, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
	};
});
