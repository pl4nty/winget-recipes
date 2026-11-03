import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags are build labels (e.g. 0.11.x04), so read the version from the
// Windows zip asset name (Strem-0.11.65-win-x64.zip).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'strem-app',
		repo: 'strem',
	});

	const asset = release.urls().find((url) => /\/Strem-\d+(?:\.\d+)+-win-x64\.zip$/.test(url));
	const {
		groups: [version],
	} = match(asset, /\/Strem-(\d+(?:\.\d+)+)-win-x64\.zip$/, 'No Strem win-x64 zip in the latest release');

	return {
		version,
		urls: () => [asset!],
		releaseNotes: {
			source: 'github',
			owner: 'strem-app',
			repo: 'strem',
			tag: release.rawTag,
		},
	};
});
