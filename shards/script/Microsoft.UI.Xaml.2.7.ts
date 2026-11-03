import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

import { appxVersion, download } from '../../lib/appx';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'microsoft-ui-xaml',
		sortByVersion: true,
		perPage: 100,
		tagRegex: '^v2\\.7\\.',
		assetRegex: '^Microsoft\\.UI\\.Xaml\\.2\\.7\\.(?:arm|arm64|x64|x86)\\.appx$',
	});
	const x64 = release.urls().find((url) => url.endsWith('.x64.appx'))!;

	return {
		version: appxVersion(await download(x64)),
		urls: release.urls,
	};
});
