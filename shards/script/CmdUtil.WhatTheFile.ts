import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream PackageVersion keeps the tag's leading v (v1.0.1), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'UsernameIsNotAvailiable', repo: 'whatthefile' });
	if (!/^v\d+(?:\.\d+)+$/.test(release.rawTag)) throw new Error(`Unexpected WhatTheFile tag ${release.rawTag}`);

	return {
		version: release.rawTag,
		urls: () => [`https://github.com/UsernameIsNotAvailiable/whatthefile/releases/download/${release.rawTag}/whatthefile.exe`],
		releaseNotes: { source: 'github', owner: 'UsernameIsNotAvailiable', repo: 'whatthefile', tag: release.rawTag },
	};
});
