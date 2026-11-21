import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged with the version code (447), while PackageVersion is the
// version name (4.47): the first digit is the major version.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'kawaiiDango', repo: 'pano-scrobbler' });
	const {
		groups: [major, minor],
	} = match(rawTag, /^(\d)(\d+)$/, 'Unexpected pano-scrobbler release tag');

	return {
		version: `${major}.${minor}`,
		urls: () => [`https://github.com/kawaiiDango/pano-scrobbler/releases/download/${rawTag}/pano-scrobbler-windows-x64.exe`],
		releaseNotes: { source: 'github', owner: 'kawaiiDango', repo: 'pano-scrobbler', tag: rawTag, cleanup: false },
	};
});
