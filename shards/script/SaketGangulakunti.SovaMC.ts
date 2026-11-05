import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The only release is tagged "hi" and the exe has no version resource, so the
// version is taken from the release title, falling back to the tag.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'SaketGangulakunti',
		repo: 'SovaMC',
	});

	const version = match(
		`${release.title ?? ''} ${release.rawTag}`,
		/(\d+(?:\.\d+)+)/,
		'No version found in the SovaMC release title or tag',
	).groups[0];
	const urls = () => release.urls().filter((url) => /\/SovaMC\.exe$/.test(url));

	return {
		version,
		urls,
	};
});
