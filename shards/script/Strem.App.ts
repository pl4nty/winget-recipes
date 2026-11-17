import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Strem tags releases as 0.11.x05, but the version is the CI build number in the
// asset name (Strem-0.11.68-win-x64.zip), so read it from the release assets.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'strem-app', repo: 'strem' });
	const {
		captures: { version },
	} = match(release.assetNames().join('\n'), /^Strem-(?<version>\d+(?:\.\d+)+)-win-x64\.zip$/m, 'No Strem Windows asset found');

	return {
		version,
		urls: () => release.urls().filter((url) => url.endsWith(`/Strem-${version}-win-x64.zip`)),
		releaseNotes: { source: 'github', owner: 'strem-app', repo: 'strem', tag: release.rawTag, cleanup: false },
	};
});
