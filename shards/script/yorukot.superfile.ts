import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'yorukot', repo: 'superfile' });
	// Upstream PackageVersion keeps the leading v of the tag (v1.6.0).
	const version = release.rawTag;
	const base = `https://github.com/yorukot/superfile/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			{ url: `${base}/superfile-windows-${release.rawTag}-amd64.zip`, architecture: 'x64' },
			{ url: `${base}/superfile-windows-${release.rawTag}-arm64.zip`, architecture: 'arm64' },
		],
		releaseNotes: { source: 'github', owner: 'yorukot', repo: 'superfile', tag: release.rawTag },
	};
});
