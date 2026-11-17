import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// winget-pkgs keeps the tag's v prefix (v0.1.13), which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'nstr-dev', repo: 'igitt' });

	return {
		version: release.rawTag,
		urls: () => [`https://github.com/nstr-dev/igitt/releases/download/${release.rawTag}/igitt-setup-windows-amd64-${release.rawTag}.exe`],
		releaseNotes: { source: 'github', owner: 'nstr-dev', repo: 'igitt', tag: release.rawTag },
	};
});
