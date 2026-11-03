import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags carry build metadata (e.g. v0.18.0+2026073100.0.0), but the
// package version is only the semver part. The asset URL needs the full tag.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'oxidecomputer',
		repo: 'oxide.rs',
		useLatestEndpoint: true,
	});

	const version = match(release.rawTag, /^v?(\d+(?:\.\d+)+)(?:\+|$)/).groups[0];
	const urls = () => release.urls().filter((url) => /\/oxide-cli-[^/]+-pc-windows-msvc\.zip$/.test(url));

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'oxidecomputer',
			repo: 'oxide.rs',
			tag: release.rawTag,
		},
	};
});
