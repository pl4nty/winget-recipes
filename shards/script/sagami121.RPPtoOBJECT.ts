import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags look like 1.0Beta3, but the package versions are lower case (1.0beta3).
// The releases may be marked as prereleases, so include them.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'sagami121',
		repo: 'RPPtoOBJECT',
		kind: 'all',
	});

	const version = release.rawTag.replace(/^v/i, '').toLowerCase();
	const urls = () => release.urls().filter((url) => /\/RPPtoOBJECT_[^/]+_Setup\.exe$/i.test(url));

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'sagami121',
			repo: 'RPPtoOBJECT',
			tag: release.rawTag,
		},
	};
});
