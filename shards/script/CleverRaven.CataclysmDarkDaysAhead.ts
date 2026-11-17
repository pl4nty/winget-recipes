import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect, getReleaseByTag } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Stable releases are tagged "<version>-RELEASE" (0.H-RELEASE) next to daily experimental
// prereleases, and the asset names carry a build timestamp instead of the version.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'CleverRaven', repo: 'Cataclysm-DDA' });
	const version = match(rawTag, /^(\d+\.[A-Z])-RELEASE$/).groups[0];
	const release = await getReleaseByTag({ owner: 'CleverRaven', repo: 'Cataclysm-DDA', tag: rawTag });
	const asset = release.assets.find((a) => /^cdda-windows-with-graphics-and-sounds-x64-[\d-]+\.zip$/.test(a.name));
	if (!asset) throw new Error(`No cdda-windows-with-graphics-and-sounds-x64 asset on ${rawTag}`);

	return {
		version,
		urls: () => [asset.browser_download_url],
	};
});
