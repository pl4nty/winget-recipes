import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Releases are tagged with a comma instead of a dot (2,0 for 2.0), which JSON shards cannot rewrite.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'thedoggybrad',
		repo: 'edgescape_navigator',
	});
	const tag = decodeURIComponent(release.rawTag);

	return {
		version: tag.replaceAll(',', '.'),
		urls: () => [
			`https://github.com/thedoggybrad/edgescape_navigator/releases/download/${encodeURIComponent(tag)}/setup.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/thedoggybrad/edgescape_navigator/releases/tag/${release.rawTag}`,
		},
	};
});
