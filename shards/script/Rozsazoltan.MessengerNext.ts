import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The vendor re-tags rebuilds of a version as v1.9.0-1, v1.9.0-2, ... while
// the package keeps the plain version. The asset URL needs the full tag.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'rozsazoltan',
		repo: 'messenger',
	});

	const version = match(release.rawTag, /^v?(\d+(?:\.\d+)+)(?:-\d+)?$/).groups[0];

	return {
		version,
		urls: () => [`https://github.com/rozsazoltan/messenger/releases/download/${release.rawTag}/messenger-next.msi`],
		releaseNotes: {
			source: 'github',
			owner: 'rozsazoltan',
			repo: 'messenger',
			tag: release.rawTag,
		},
	};
});
