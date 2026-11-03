import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Git for Windows tags releases as 2.56.0.windows.4, but the package version
// (and the asset name) is 2.56.0.4. The first build, .windows.1, is 2.56.0.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'git-for-windows',
		repo: 'git',
	});

	const {
		groups: [baseVersion, buildNumber],
	} = match(release.rawTag, /^v?(\d+(?:\.\d+)+)\.windows\.(\d+)$/);
	const version = buildNumber === '1' ? baseVersion : `${baseVersion}.${buildNumber}`;

	return {
		version,
		urls: () => [
			`https://github.com/git-for-windows/git/releases/download/${release.rawTag}/MinGit-${version}-busybox-32-bit.zip`,
			`https://github.com/git-for-windows/git/releases/download/${release.rawTag}/MinGit-${version}-busybox-64-bit.zip`,
			`https://github.com/git-for-windows/git/releases/download/${release.rawTag}/MinGit-${version}-busybox-arm64.zip`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/git-for-windows/git/releases/tag/${release.rawTag}`,
		},
	};
});
