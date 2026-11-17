import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Installer names carry a build number after the release version (9.3.8-0), and winget-pkgs files
// that as a four-part version (9.3.8.0), so read both from the latest release's x64 installer name.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'Euro-Office', repo: 'DesktopEditors', useLatestEndpoint: true });
	const {
		captures: { version, build },
	} = match(
		release.assetNames().join('\n'),
		/^Euro-Office-DesktopEditors-(?<version>\d+(?:\.\d+)+)-(?<build>\d+)-windows-x64\.exe$/im,
		'No Euro-Office DesktopEditors x64 installer found',
	);
	const base = `https://github.com/Euro-Office/DesktopEditors/releases/download/${release.rawTag}/Euro-Office-DesktopEditors-${version}-${build}-windows`;

	return {
		version: `${version}.${build}`,
		urls: () => [`${base}-x64.exe`, `${base}-arm64.exe`],
		releaseNotes: { source: 'github', owner: 'Euro-Office', repo: 'DesktopEditors', tag: release.rawTag, cleanup: false },
	};
});
