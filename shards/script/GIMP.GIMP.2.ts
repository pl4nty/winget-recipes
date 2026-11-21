import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// GIMP 2.10 installers are rebuilt as gimp-<version>-setup-<n>.exe, so take the latest version's highest rebuild.
export default defineShard(async () => {
	const listing = await fetch('https://download.gimp.org/gimp/v2.10/windows/').then((response) => response.text());
	const builds = [...listing.matchAll(/gimp-(2\.10\.\d+)-setup(?:-(\d+))?\.exe/g)].map(([file, version, rebuild]) => ({
		file: file!,
		version: version!,
		rebuild: Number(rebuild ?? 0),
	}));
	const build = builds.sort((a, b) => compareVersions(a.version, b.version) || a.rebuild - b.rebuild).at(-1);
	if (!build) throw new Error('No GIMP 2.10 installer found');

	return {
		version: build.version,
		urls: () => [`https://download.gimp.org/gimp/v2.10/windows/${build.file}`],
	};
});
