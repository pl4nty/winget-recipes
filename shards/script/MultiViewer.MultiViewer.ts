import { defineShard } from 'anthelion';

// The release API lists each download with a platform; the URLs carry a random path segment.
export default defineShard(async () => {
	const { version, downloads } = (await fetch('https://api.multiviewer.app/api/v1/releases/latest').then((response) =>
		response.json(),
	)) as { version: string; downloads: { platform: string; type: string; name: string; url: string }[] };
	const find = (platform: string, pattern: RegExp) => {
		const download = downloads.find((d) => d.platform === platform && d.type === 'download' && pattern.test(d.name));
		if (!download) throw new Error(`No ${platform} download for MultiViewer ${version}`);
		return download.url;
	};

	return {
		version,
		urls: () => [
			{ url: find('win32', /-x64-Setup\.exe$/), architecture: 'x64' as const },
			{ url: find('win32_portable', /-win32-x64-.*\.zip$/), architecture: 'x64' as const },
		],
		releaseNotes: { releaseNotesUrl: 'https://multiviewer.app/changelog' },
	};
});
