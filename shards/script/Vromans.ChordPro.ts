import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are R6.070 style; the package version comes from the installer name (6-70-7-2 -> 6.70.7.2).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'ChordPro', repo: 'chordpro' });
	const installer = /\/ChordPro-Installer-(\d+(?:-\d+)+)-msw-x64\.exe$/;
	const url = release.urls().find((url) => installer.test(url));
	const version = match(url, installer).groups[0].replaceAll('-', '.');

	return {
		version,
		urls: () => [url!],
		releaseNotes: { source: 'github', owner: 'ChordPro', repo: 'chordpro', tag: release.rawTag },
	};
});
