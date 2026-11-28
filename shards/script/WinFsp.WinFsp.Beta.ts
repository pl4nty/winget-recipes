import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Beta tags such as v2.1B2 differ from the package version, which is the MSI's build number.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'winfsp',
		repo: 'winfsp',
		kind: 'prerelease',
		assetRegex: '^winfsp-\\d+(?:\\.\\d+)+\\.msi$',
	});
	const [url] = release.urls();
	const {
		groups: [version],
	} = match(url, /winfsp-(\d+(?:\.\d+)+)\.msi$/i, `No WinFsp MSI in ${release.rawTag}`);

	return {
		version,
		urls: () => [url!],
	};
});
