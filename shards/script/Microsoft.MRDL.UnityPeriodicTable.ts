import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'MRDL_Unity_PeriodicTable',
		useLatestEndpoint: true,
		assetRegex: '_ARM64_Master\\.appx$',
	});
	const { groups } = match(release.urls()[0]!, /_(\d+\.\d+\.\d+)\.\d+_ARM64_Master\.appx$/);

	return {
		version: groups[0],
		urls: release.urls,
	};
});
