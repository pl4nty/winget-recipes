import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// LPub3D publishes Windows builds on the rolling "continuous" release, named
// LPub3D-<version>.<revision>.<build>_<date>.exe, so the package version comes
// from the installer asset name rather than the tag.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'trevorsandy',
		repo: 'lpub3d',
		tag: 'continuous',
	});

	const url = release.assets
		.map((asset) => asset.browser_download_url)
		.find((assetUrl) => /\/LPub3D-\d+(?:\.\d+)+_\d{8}\.exe$/.test(assetUrl));
	if (!url) throw new Error('No LPub3D Windows installer on the continuous release');

	const version = match(url, /\/LPub3D-(\d+(?:\.\d+)+)_\d{8}\.exe$/).groups[0];

	return {
		version,
		urls: () => [url],
		releaseNotes: {
			source: 'github',
			owner: 'trevorsandy',
			repo: 'lpub3d',
			tag: 'continuous',
		},
	};
});
