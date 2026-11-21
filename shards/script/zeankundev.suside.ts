import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Rebuild releases such as 2.3.3.1 ship Suside_Installer_2.3.3_win.exe, and the package
// version follows the installer name, not the tag.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'zeankundev', repo: 'suside', useLatestEndpoint: true });
	const url = release.urls().find((url) => /\/Suside(?:\.Editor)?_Installer_[\d.]+_win\.exe$/.test(url));
	if (!url) throw new Error(`No Windows installer in Suside ${release.rawTag}`);
	const {
		groups: [version],
	} = match(url, /_Installer_(\d+(?:\.\d+)+)_win\.exe$/);

	return {
		version,
		urls: () => [url],
		releaseNotes: { source: 'github', owner: 'zeankundev', repo: 'suside', tag: release.rawTag },
	};
});
