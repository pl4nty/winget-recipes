import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Halloy tags releases as 2026.9 (or 2026.7.1 for point releases), while the
// package version always has three parts: 2026.9.0, 2026.7.1.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'squidowl',
		repo: 'halloy',
	});

	const parts = release.rawTag.split('.');
	const version = parts.length === 2 ? `${release.rawTag}.0` : release.rawTag;

	return {
		version,
		urls: () => [
			`https://github.com/squidowl/halloy/releases/download/${release.rawTag}/halloy-installer.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/squidowl/halloy/releases/tag/${release.rawTag}`,
		},
	};
});
