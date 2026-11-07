import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the leading v in PackageVersion (v2026.8.7), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Sidekick-Poe',
		repo: 'Sidekick',
	});

	const urls = () => {
		const url = release.urls().find((u) => u.endsWith('/Sidekick-windows-x64-Setup.exe'));
		if (!url) throw new Error(`Sidekick x64 setup not found in ${release.rawTag}`);
		return [url];
	};

	return {
		version: release.rawTag,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'Sidekick-Poe',
			repo: 'Sidekick',
			tag: release.rawTag,
		},
	};
});
