import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// winget-pkgs versions this package as <tag without v>-release (3.0.2-release), so keep
// that suffix. Not every release ships a Windows installer (v3.0.3 has none), so pick the
// greatest version that does.
const owner = 'input-leap';
const repo = 'input-leap';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner,
		repo,
		sortByVersion: true,
		assetRegex: 'windows.*\\.exe$',
	});

	return {
		version: `${release.version}-release`,
		urls: () => release.urls().map((url) => ({ url, architecture: 'x64' })),
		releaseNotes: {
			source: 'github',
			owner,
			repo,
			tag: release.rawTag,
		},
	};
});
