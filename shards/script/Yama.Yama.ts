import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// The release tags (v.1.1.1) don't match the package version (1.11), which
// upstream takes from the installer asset name: YAMA-v.<version>_x64-setup.exe.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'mrenanpx', repo: 'appyama-novo' });
	const asset = release.assets
		.map((asset) => ({
			url: asset.browser_download_url,
			version: /^YAMA-v\.?(\d+(?:\.\d+)*)_x64-setup\.exe$/i.exec(asset.name)?.[1],
		}))
		.find((asset): asset is { url: string; version: string } => asset.version !== undefined);
	if (!asset) {
		throw new Error(`No YAMA x64 setup asset on release ${release.rawTag}`);
	}

	return {
		version: asset.version,
		urls: () => [asset.url],
	};
});
