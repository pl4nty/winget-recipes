import { defineShard } from 'anthelion';

// The builds API reports the version and build number separately (WinGet joins them, e.g. 2.3.1.3685),
// and its download links redirect to files.dengine.net/archive, so build the final URLs here.
export default defineShard(async () => {
	const build = (await fetch('https://api.dengine.net/1/builds?format=json&latest_for=win-x64&type=candidate').then((response) =>
		response.json(),
	)) as { version: string; build_uniqueid: number };
	if (!/^\d+(?:\.\d+)+$/.test(build.version)) throw new Error(`Unexpected Doomsday version ${build.version}`);
	const file = (arch: string) => `doomsday_${build.version}-build${build.build_uniqueid}_${arch}.msi`;

	return {
		version: `${build.version}.${build.build_uniqueid}`,
		urls: () => ['x86', 'x64'].map((arch) => `https://files.dengine.net/archive/${file(arch)}`),
		releaseNotes: { releaseNotesUrl: `https://manual.dengine.net/version/${build.version}` },
	};
});
