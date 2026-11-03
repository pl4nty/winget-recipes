import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Asset names vary between releases, so pick them from the release instead of a URL template.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'ElektroStudios',
		repo: 'Easy-Link-File-Viewer',
	});
	const assets = release.urls();
	const zip = assets.find((url) => /AnyCPU\.zip$/i.test(url)) ?? assets.find((url) => /\.zip$/i.test(url));
	if (!zip) throw new Error(`No zip asset in release ${release.rawTag}: ${release.assetNames().join(', ')}`);
	const setup = assets.find((url) => /setup[^/]*\.exe$/i.test(url));

	return {
		version: release.version,
		urls: () => [
			{ url: zip, architecture: 'x64' },
			{ url: zip, architecture: 'arm64' },
			...(setup ? [setup] : []),
		],
		releaseNotes: {
			source: 'github',
			owner: 'ElektroStudios',
			repo: 'Easy-Link-File-Viewer',
			tag: release.rawTag,
		},
	};
});
