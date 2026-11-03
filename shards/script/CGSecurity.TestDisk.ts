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

	return {
		version: latest.version,
		// The x86 build (.win.zip) is left out: komac splits its four tools into four separate installers.
		urls: () => [`https://www.cgsecurity.org/${file}.win64.zip`],
		releaseNotes: {
			releaseNotesUrl: latest.suffix
				? 'https://www.cgsecurity.org/wiki/TestDisk_Download'
				: `https://www.cgsecurity.org/wiki/TestDisk_${latest.version}_Release`,
		},
	};
});
