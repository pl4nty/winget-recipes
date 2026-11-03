import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// The download page lists every release, stable (testdisk-7.2.win64.zip) and beta (testdisk-7.3-WIP.win64.zip),
// so take the newest win64 build and keep its suffix for the file names.
export default defineShard(async () => {
	const page = await ky('https://www.cgsecurity.org/wiki/TestDisk_Download').text();
	const builds = Array.from(page.matchAll(/\/testdisk-(\d+(?:\.\d+)+)(-WIP)?\.win64\.zip"/g), (m) => ({
		version: m[1]!,
		suffix: m[2] ?? '',
	}));
	if (!builds.length) throw new Error('No TestDisk win64 build found');
	const latest = builds.sort((a, b) => compareVersions(b.version, a.version) || a.suffix.length - b.suffix.length)[0]!;
	const file = `testdisk-${latest.version}${latest.suffix}`;
	const tools = ['fidentify', 'photorec', 'qphotorec', 'testdisk'];

	return {
		version: latest.version,
		urls: () =>
			['win64', 'win'].map((build) => ({
				url: `https://www.cgsecurity.org/${file}.${build}.zip`,
				architecture: build === 'win64' ? ('x64' as const) : ('x86' as const),
				nestedInstallerMatches: tools.map((tool) => `${tool}_win.exe`),
			})),
		releaseNotes: {
			releaseNotesUrl: latest.suffix
				? 'https://www.cgsecurity.org/wiki/TestDisk_Download'
				: `https://www.cgsecurity.org/wiki/TestDisk_${latest.version}_Release`,
		},
	};
});
