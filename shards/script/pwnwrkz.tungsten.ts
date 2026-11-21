import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the leading "v" in PackageVersion (v3.1.1), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'pwnwrkz',
		repo: 'tungsten',
	});

	const urls = () => {
		const url = release.urls().find((u) => u.endsWith('/tungsten-cli-x86_64-pc-windows-msvc.zip'));
		if (!url) throw new Error(`tungsten x64 zip not found in ${release.rawTag}`);
		return [url];
	};

	return {
		version: release.rawTag,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'pwnwrkz',
			repo: 'tungsten',
			tag: release.rawTag,
		},
	};
});
