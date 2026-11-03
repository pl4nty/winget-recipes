import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'ozone10', repo: '7zip-Dark7zip' });
	// Tag v26.05-v0.77.0: assets use 26.05-v0.77.0, upstream PackageVersion is 26.05-0.77.0.
	const assetVersion = release.rawTag.replace(/^v/i, '');
	const version = assetVersion.replace('-v', '-');
	const base = `https://github.com/ozone10/7zip-Dark7zip/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			{ url: `${base}/7z${assetVersion}-x64-fluent-installer.zip`, architecture: 'x64' },
			{ url: `${base}/7z${assetVersion}-arm64-fluent-installer.zip`, architecture: 'arm64' },
		],
		releaseNotes: { source: 'github', owner: 'ozone10', repo: '7zip-Dark7zip', tag: release.rawTag },
	};
});
