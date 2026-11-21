import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags carry a release name (2018.05.0.TIF); upstream PackageVersion is the version in the asset name (2018.05).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'codilime', repo: 'veles' });
	const asset = release.assets.find((a) => /^Veles_\d+(?:\.\d+)+_64bit_Windows\.exe$/.test(a.name));
	if (!asset) throw new Error(`No 64-bit Windows installer in Veles release ${release.rawTag}`);
	const version = asset.name.match(/^Veles_(\d+(?:\.\d+)+)_64bit_Windows\.exe$/)![1]!;

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'codilime', repo: 'veles', tag: release.rawTag },
	};
});
