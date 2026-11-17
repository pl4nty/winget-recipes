import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// The setup asset name changes between releases (Mandelbulber2-v2.33-Setup.exe), so it is read from the release.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'buddhi1980', repo: 'mandelbulber2', useLatestEndpoint: true });
	const asset = release.assets.find((a) => /setup.*\.exe$/i.test(a.name));
	if (!asset) throw new Error(`No setup exe asset on ${release.rawTag}`);

	return {
		version: release.version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'buddhi1980', repo: 'mandelbulber2', tag: release.rawTag },
	};
});
