import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release assets carry a build number and commit hash
// (sakura-tag-v2.4.3-build2916-fe1a4a281-Win32-Release-Installer.zip), and the
// nested Inno setup name carries another build number, so take the installer
// zip from the release assets and match the nested setup by prefix.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'sakura-editor',
		repo: 'sakura',
	});

	const urls = () =>
		release
			.urls()
			.filter((url) => /\/sakura-tag-v[^/]+-Win32-Release-Installer\.zip$/.test(url))
			.map((url) => ({ url, architecture: 'x86' as const, nestedInstallerMatches: ['sakura_install'] }));

	return {
		version: release.version,
		urls,
		releaseNotes: {
			releaseNotesUrl: 'https://github.com/sakura-editor/sakura/blob/master/CHANGELOG.md',
		},
	};
});
