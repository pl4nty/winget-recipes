import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// The repo (moved from aither-adk to awdk) publishes many product releases; shell
// releases are tagged shell-v<version> and fall outside the default 25-release page.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Aitherium',
		repo: 'awdk',
		tagRegex: '^shell-v',
		perPage: 100,
	});

	return {
		version: release.version,
		urls: () => [`https://github.com/Aitherium/awdk/releases/download/${release.rawTag}/aither-shell-win64.exe`],
		releaseNotes: { source: 'github', owner: 'Aitherium', repo: 'awdk', tag: release.rawTag, cleanup: false },
	};
});
