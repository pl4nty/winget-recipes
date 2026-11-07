import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream package versions keep the tag's v prefix (v2.4.2366), which JSON
// shards always strip, so return the raw tag as the version.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Suwayomi',
		repo: 'Suwayomi-Server',
	});
	const tag = release.rawTag;

	return {
		version: tag,
		urls: () => [`https://github.com/Suwayomi/Suwayomi-Server/releases/download/${tag}/Suwayomi-Server-${tag}-windows-x64.msi`],
		releaseNotes: {
			source: 'github',
			owner: 'Suwayomi',
			repo: 'Suwayomi-Server',
			tag,
		},
	};
});
