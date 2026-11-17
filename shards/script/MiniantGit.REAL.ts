import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged updater-vN, REAL.exe has no version resource, and the version is in the release title.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'miniant-git', repo: 'REAL', useLatestEndpoint: true });
	const {
		groups: [version],
	} = match(release.title, /(\d+(?:\.\d+)+)/, `No version in release title ${release.title}`);

	return {
		version,
		urls: () => [`https://github.com/miniant-git/REAL/releases/download/${release.rawTag}/REAL.exe`],
	};
});
