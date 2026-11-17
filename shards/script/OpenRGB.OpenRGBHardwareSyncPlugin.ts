import { defineShard } from 'anthelion';

// Codeberg release assets carry a commit hash, so read the MSI name from the latest release.
// PackageVersion upstream is the MSI version (ARP DisplayVersion), not the release tag.
export default defineShard(async () => {
	const release = (await fetch('https://codeberg.org/api/v1/repos/OpenRGB/OpenRGBHardwareSyncPlugin/releases/latest').then((response) =>
		response.json(),
	)) as { tag_name: string; assets: { name: string; browser_download_url: string }[] };
	const msi = release.assets.find((asset) => /_Windows_64_[0-9a-f]+\.msi$/i.test(asset.name));
	if (!msi) throw new Error(`No Windows MSI in ${release.tag_name}`);

	return {
		version: { source: 'display' },
		state: release.tag_name,
		urls: () => [msi.browser_download_url],
		releaseNotes: { releaseNotesUrl: `https://codeberg.org/OpenRGB/OpenRGBHardwareSyncPlugin/releases/tag/${release.tag_name}` },
	};
});
