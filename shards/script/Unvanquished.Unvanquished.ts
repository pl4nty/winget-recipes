import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The package version follows the game release (v0.56.2 is Beta-56-release-patch-2).
// The download is the vendor's unversioned updater link, as in the upstream manifest.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Unvanquished',
		repo: 'Unvanquished',
	});

	const {
		groups: [minor, patch],
	} = match(release.rawTag, /^v?0\.(\d+)\.(\d+)$/);
	const version = `Beta-${minor}-release${patch === '0' ? '' : `-patch-${patch}`}`;

	return {
		version,
		urls: () => [{ url: 'https://unvanquished.net/download/windows', architecture: 'x86' }],
		releaseNotes: {
			source: 'github',
			owner: 'Unvanquished',
			repo: 'Unvanquished',
			tag: release.rawTag,
		},
	};
});
