import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// OpenRGB moved its releases to Codeberg. Tags are release_<major>.<minor>[.<patch>]
// and the asset names carry a commit hash, e.g. OpenRGB_1.1_Windows_64_8e16de2.msi.
// winget-pkgs uses three-part versions (release_1.1 -> 1.1.0).
const api = 'https://codeberg.org/api/v1/repos/OpenRGB/OpenRGB/releases/latest';

type Release = {
	tag_name: string;
	html_url: string;
	assets: { name: string; browser_download_url: string }[];
};

export default defineShard(async () => {
	const release = await ky(api).json<Release>();

	const {
		groups: [tagVersion],
	} = match(release.tag_name, /^release_(\d+(?:\.\d+)*)$/);
	const parts = tagVersion.split('.');
	while (parts.length < 3) parts.push('0');
	const version = parts.join('.');

	const msi = release.assets.find((asset) => /_Windows_64_[0-9a-f]+\.msi$/i.test(asset.name));
	if (!msi) throw new Error('No Windows 64-bit MSI in the latest Codeberg release');

	return {
		version,
		urls: () => [msi.browser_download_url],
		releaseNotes: {
			source: 'json',
			sourceUrl: api,
			path: 'body',
			nestedSource: 'markdown',
			releaseNotesUrl: release.html_url,
			cleanup: false,
		},
	};
});
