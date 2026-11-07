import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream PackageVersion keeps the leading "v" of the tag (v0.8.1), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'OfficialAroCodes',
		repo: 'AroCrypt',
	});

	return {
		version: release.rawTag,
		urls: () => release.urls().filter((url) => /\/AroCrypt-Setup-[^/]+\.exe$/.test(url)),
		releaseNotes: {
			source: 'github',
			owner: 'OfficialAroCodes',
			repo: 'AroCrypt',
			tag: release.rawTag,
		},
	};
});
