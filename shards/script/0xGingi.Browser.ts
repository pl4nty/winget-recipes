import { defineShard } from 'anthelion';
import { getLatestRelease, getReleaseByTag } from 'anthelion/github';

// The installer is released in 0xgingi-browser and the portable zip in 0xgingi-browser-windows
// under the same tag; asset names carry an unpredictable build suffix (e.g. -1.1).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: '0xGingi',
		repo: '0xgingi-browser',
		useLatestEndpoint: true,
		assetRegex: '_installer\\.exe$',
	});
	const portable = await getReleaseByTag({ owner: '0xGingi', repo: '0xgingi-browser-windows', tag: release.rawTag });
	const installer = release.assets.find((asset) => /_installer\.exe$/i.test(asset.name));
	const zip = portable.assets.find((asset) => /_windows\.zip$/i.test(asset.name));
	if (!installer || !zip) throw new Error(`0xgingi-browser ${release.rawTag} is missing its installer or portable zip`);

	return {
		version: release.version,
		urls: () => [installer.browser_download_url, zip.browser_download_url],
		releaseNotes: { source: 'github', owner: '0xGingi', repo: '0xgingi-browser-windows', tag: release.rawTag },
	};
});
