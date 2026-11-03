import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

import { appxVersion, download } from '../../lib/appx';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'busiotools',
		sortByVersion: true,
		assetRegex: '^Dependencies\\.zip$',
	});
	const [url] = release.urls();

	return {
		version: appxVersion(await download(url!), /x64\/Microsoft\.NET\.Native\.Runtime\.2\.2\.appx$/),
		urls: () => (['x64', 'x86', 'arm64', 'arm'] as const).map((architecture) => ({ url: url!, architecture })),
	};
});
