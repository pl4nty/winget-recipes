import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Upstream keeps the raw alpha tag as PackageVersion (v1.0.0-alpha04), which
// JSON shards would change, and the repo also has -dev@ and -test tags, so only
// alpha releases are taken.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'prayag17',
		repo: 'Blink',
		kind: 'all',
		tagRegex: '^(?=v\\d+(?:\\.\\d+)+-alpha\\d+$)',
	});
	const version = match(release.rawTag, /^(v\d+(?:\.\d+)+-alpha\d+)$/).groups[0];

	return {
		version,
		urls: () => release.urls().filter((url) => /\/Blink_[^/]+_x64-setup\.exe$/.test(url)),
		releaseNotes: {
			source: 'github',
			owner: 'prayag17',
			repo: 'Blink',
			tag: release.rawTag,
			cleanup: false,
		},
	};
});
