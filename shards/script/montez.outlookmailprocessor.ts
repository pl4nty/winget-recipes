import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v35) and tags it as vv35,
// so strip exactly one "v" from the tag (JSON shards would strip both).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'kriszty99',
		repo: 'outlook-mail-processor',
	});

	const version = match(release.rawTag, /^v(v\d+(?:\.\d+)*)$/).groups[0];
	const urls = () =>
		release.urls().filter((url) => /\/OutlookMailProcessor_[^/]+_Setup\.exe$/.test(url));

	return {
		version,
		urls,
	};
});
