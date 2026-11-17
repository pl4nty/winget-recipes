import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags look like v1.0.1_ms and the bundle is named with a build stamp and a
// capitalised .Msixbundle extension, which the default asset filter skips.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'huoyan1231',
		repo: 'CmdpalTempCleaner',
	});

	const base = match(release.rawTag, /^v?(\d+(?:\.\d+)+)/).groups[0];
	const urls = release.assets
		.filter((asset) => /\.msixbundle$/i.test(asset.name))
		.map((asset) => asset.browser_download_url);
	if (urls.length === 0) throw new Error(`No msixbundle in ${release.rawTag}`);

	return {
		version: `${base}.0`,
		urls: () => urls,
	};
});
