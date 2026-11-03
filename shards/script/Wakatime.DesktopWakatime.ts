import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Rebuild tags look like v3.0.0+1; upstream maps them to 3.0.0.1.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'wakatime',
		repo: 'desktop-wakatime',
	});

	const version = release.rawTag.replace(/^v/, '').replace('+', '.');
	const base = `https://github.com/wakatime/desktop-wakatime/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			{ url: `${base}/wakatime-win32-ia32.exe`, architecture: 'x86' },
			{ url: `${base}/wakatime-win32-x64.exe`, architecture: 'x64' },
			{ url: `${base}/wakatime-win32-arm64.exe`, architecture: 'arm64' },
		],
		releaseNotes: {
			source: 'github',
			owner: 'wakatime',
			repo: 'desktop-wakatime',
			tag: release.rawTag,
		},
	};
});
