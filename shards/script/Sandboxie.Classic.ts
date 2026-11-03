import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Releases are tagged with the Plus version (v1.18.8); the Classic version (5.73.8) is only in the asset name.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'sandboxie-plus',
		repo: 'Sandboxie',
		useLatestEndpoint: true,
	});

	const classic = /\/Sandboxie-Classic-(x64|x86|ARM64)-v(\d+(?:\.\d+)+)\.exe$/i;
	const assets = release.urls().filter((url) => classic.test(url));
	const x64 = assets.find((url) => /-x64-/i.test(url));
	if (!x64) throw new Error(`No Sandboxie Classic x64 installer in ${release.rawTag}`);
	const version = classic.exec(x64)![2]!;

	return {
		version,
		urls: () => [x64, ...assets.filter((url) => url !== x64 && url.includes(`-v${version}.exe`))],
		releaseNotes: {
			source: 'github',
			owner: 'sandboxie-plus',
			repo: 'Sandboxie',
			tag: release.rawTag,
		},
	};
});
