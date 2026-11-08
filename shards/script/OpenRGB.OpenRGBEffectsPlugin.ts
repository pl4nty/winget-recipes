import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Releases are on Codeberg, and the MSI name carries the build's short commit
// hash, so take the asset from the latest release instead of a URL template.
type Release = {
	tag_name: string;
	html_url: string;
	body: string;
	assets: { name: string; browser_download_url: string }[];
};

export default defineShard(async () => {
	const release: Release = await fetch(
		'https://codeberg.org/api/v1/repos/OpenRGB/OpenRGBEffectsPlugin/releases/latest',
	).then((response) => response.json());
	const {
		captures: { version },
	} = match(release.tag_name, /^release_(?<version>\d+(?:\.\d+)+)$/);
	const msi = release.assets.find((asset) => /_Windows_64_[0-9a-f]+\.msi$/.test(asset.name));
	if (!msi) throw new Error(`No Windows 64-bit MSI in ${release.tag_name}`);

	return {
		version,
		urls: () => [msi.browser_download_url],
		releaseNotes: {
			source: 'markdown',
			sourceUrl: `data:text/markdown,${encodeURIComponent(release.body)}`,
			releaseNotesUrl: release.html_url,
			cleanup: false,
		},
	};
});
