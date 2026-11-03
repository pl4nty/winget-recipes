import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged like 1.5.0+53 (version + build number), but the package
// version is the four-part 1.5.0.0.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'iiumschedule',
		repo: 'iium_schedule',
	});

	const {
		groups: [baseVersion],
	} = match(release.rawTag, /^v?(\d+\.\d+\.\d+)\+\d+$/);

	return {
		version: `${baseVersion}.0`,
		urls: () => [
			`https://github.com/iiumschedule/iium_schedule/releases/download/${encodeURIComponent(release.rawTag)}/iiumschedulesetup.exe`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'iiumschedule',
			repo: 'iium_schedule',
			tag: release.rawTag,
		},
	};
});
