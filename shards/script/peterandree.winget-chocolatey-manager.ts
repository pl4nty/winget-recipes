import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream publishes tag v1.1.0 as PackageVersion 1.1, so a zero patch component is dropped.
export default defineShard(async () => {
	const { rawTag, version: tagVersion } = await getLatestReleaseFromRedirect({
		owner: 'peterandree',
		repo: 'winget-chocolatey-manager',
	});
	const version = tagVersion.replace(/^(\d+\.\d+)\.0$/, '$1');

	return {
		version,
		urls: () => [`https://github.com/peterandree/winget-chocolatey-manager/releases/download/${rawTag}/winget-choco-manager.exe`],
	};
});
