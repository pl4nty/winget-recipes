import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps a four-part version (1.1.0.0) while the tags are three-part
// (v1.1.0), so the tag version is padded with zeros.
export default defineShard(async () => {
	const owner = 'meowrypto';
	const repo = 'CoinPulse';
	const { rawTag, version: short } = await getLatestRelease({ owner, repo });
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [`https://github.com/${owner}/${repo}/releases/download/${rawTag}/CoinPulse.exe`],
		releaseNotes: { source: 'github', owner, repo, tag: rawTag },
	};
});
