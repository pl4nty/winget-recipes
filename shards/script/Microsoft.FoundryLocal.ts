import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'Foundry-Local',
		kind: 'prerelease',
		tagRegex: '^cli-preview-',
		assetRegex: '^foundry-[\\d.]+-win-(?:arm64|x64)\\.msix$',
	});

	return {
		version: `${release.version}.0`,
		urls: release.urls,
	};
});
