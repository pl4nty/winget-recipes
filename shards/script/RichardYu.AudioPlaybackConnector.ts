import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

const owner = 'ysc3839';
const repo = 'AudioPlaybackConnector';

// Tags are three-part (v1.3.1) but upstream PackageVersion is four-part (1.3.1.0).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner, repo });
	const parts = release.rawTag.replace(/^v/, '').split('.');
	while (parts.length < 4) parts.push('0');
	const base = `https://github.com/${owner}/${repo}/releases/download/${release.rawTag}`;

	return {
		version: parts.join('.'),
		urls: () => [
			{ url: `${base}/AudioPlaybackConnector64.exe`, architecture: 'x64' },
			{ url: `${base}/AudioPlaybackConnector32.exe`, architecture: 'x86' },
			{ url: `${base}/AudioPlaybackConnectorARM64.exe`, architecture: 'arm64' },
			{ url: `${base}/AudioPlaybackConnectorARM.exe`, architecture: 'arm' },
			{ url: `${base}/AudioPlaybackConnector32.exe`, architecture: 'neutral' },
		],
		releaseNotes: {
			source: 'github',
			owner,
			repo,
			tag: release.rawTag,
		},
	};
});
