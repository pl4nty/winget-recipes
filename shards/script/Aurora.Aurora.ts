import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// winget-pkgs keeps the release tag's leading v in PackageVersion (v0.8.1), which JSON shards strip.
export default defineShard(async () => {
	const { rawTag } = await getLatestRelease({ owner: 'antonpup', repo: 'Aurora' });
	if (!/^v\d+(?:\.\d+)+$/.test(rawTag)) throw new Error(`Unexpected Aurora release tag ${rawTag}`);

	return {
		version: rawTag,
		urls: () => [
			{ url: `https://github.com/antonpup/Aurora/releases/download/${rawTag}/Aurora-setup-${rawTag}.exe`, architecture: 'x64' },
		],
		releaseNotes: { source: 'github', owner: 'antonpup', repo: 'Aurora', tag: rawTag },
	};
});
