import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are short (1.0) while the MSI and upstream PackageVersion carry the full
// version (1.0.0), so the version is read from the latest release's MSI name.
export default defineShard(async () => {
	const { data: release } = await githubClient.rest.repos.getLatestRelease({
		owner: 'IsaqueS',
		repo: 'Aventuras-de-quintal',
	});
	const msi = release.assets.find((asset) => /^Aventuras\.de\.quintal-\d+(?:\.\d+)+\.msi$/.test(asset.name));
	if (!msi) throw new Error(`No MSI in ${release.tag_name}`);
	const {
		captures: { version },
	} = match(msi.name, /^Aventuras\.de\.quintal-(?<version>\d+(?:\.\d+)+)\.msi$/);

	return {
		version,
		urls: () => [msi.browser_download_url],
		releaseNotes: {
			source: 'github',
			owner: 'IsaqueS',
			repo: 'Aventuras-de-quintal',
			tag: release.tag_name,
			cleanup: false,
		},
	};
});
