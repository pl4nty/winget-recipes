import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are three-part (0.0.1) but upstream keeps a four-part PackageVersion
// (0.0.1.0), so the tag is padded with zeros.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Whiteknight',
		repo: 'Mdq',
		kind: 'all',
	});

	const parts = release.tag.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	const urls = () => release.urls().filter((url) => /\/mdq\.exe$/i.test(url));

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'Whiteknight',
			repo: 'Mdq',
			tag: release.rawTag,
			cleanup: false,
		},
	};
});
