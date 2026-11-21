import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the leading `v` in PackageVersion (v1.4.0), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'webadderallorg',
		repo: 'Recordly',
	});

	return {
		version: release.rawTag,
		urls: () => [
			`https://github.com/webadderallorg/Recordly/releases/download/${release.rawTag}/Recordly-windows-x64.exe`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'webadderallorg',
			repo: 'Recordly',
			tag: release.rawTag,
		},
	};
});
