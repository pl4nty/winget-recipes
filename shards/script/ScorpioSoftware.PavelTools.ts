import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Releases are tagged with two-part versions (v1.7), but winget-pkgs uses three parts
// (1.7.0), which a JSON shard can't add.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'zodiacon', repo: 'AllTools' });
	const parts = release.version.split('.');
	const version = parts.length === 2 ? `${release.version}.0` : release.version;

	return {
		version,
		urls: () => [`https://github.com/zodiacon/AllTools/releases/download/${release.rawTag}/PavelTools.msi`],
		releaseNotes: { source: 'github', owner: 'zodiacon', repo: 'AllTools', tag: release.rawTag },
	};
});
