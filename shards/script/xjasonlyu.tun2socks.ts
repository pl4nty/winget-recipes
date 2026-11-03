import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream keeps the leading "v" in PackageVersion (v2.7.0); JSON shards strip it.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({
		owner: 'xjasonlyu',
		repo: 'tun2socks',
	});
	const base = `https://github.com/xjasonlyu/tun2socks/releases/download/${rawTag}`;

	return {
		version: rawTag,
		urls: () => ['386', 'amd64', 'arm64'].map((arch) => `${base}/tun2socks-windows-${arch}.zip`),
		releaseNotes: {
			source: 'github',
			owner: 'xjasonlyu',
			repo: 'tun2socks',
			tag: rawTag,
		},
	};
});
