import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream tracks the nightly (prerelease) builds, so all releases are considered.
// Release tags are translation builds (en.5-nightly.<date>); the Domino version is only in the asset name (Domino<version>_Translated.zip).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'Hans5958', repo: 'Domino-English-Translation', kind: 'all' });
	const asset = release.assets.find((a) => /^Domino\d+_Translated\.zip$/.test(a.name));
	if (!asset) throw new Error(`No Domino<version>_Translated.zip asset on ${release.rawTag}`);
	const version = asset.name.replace(/^Domino/, '').replace(/_Translated\.zip$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'Hans5958', repo: 'Domino-English-Translation', tag: release.rawTag, cleanup: false },
	};
});
