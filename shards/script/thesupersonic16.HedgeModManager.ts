import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are `7.15` for the first build of a version and `7.14-1`, `7.14-2`, ... for rebuilds;
// upstream writes the first build as `7.15-0`, so a tag without a build suffix gets `-0`.
export default defineShard(async () => {
	const owner = 'thesupersonic16';
	const repo = 'HedgeModManager';
	const release = await getLatestRelease({ owner, repo });
	const tag = release.rawTag;
	const version = tag.includes('-') ? tag : `${tag}-0`;

	return {
		version,
		urls: () => release.urls().filter((url) => url.endsWith('/HedgeModManager.exe')),
		releaseNotes: { source: 'github', owner, repo, tag },
	};
});
