import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	// Each release holds every patch build of its minor version.
	const { rawTag, assets } = await getLatestRelease({ owner: 'WindowTop', repo: 'WindowTop-App' });
	const builds = assets.flatMap((asset) => {
		const match = /^WindowTop\.(\d+\.\d+\.\d+)\.(x64|arm64)\.-\.(setup\.exe|portable\.zip)$/.exec(asset.name);
		return match ? [{ version: match[1], url: asset.browser_download_url }] : [];
	});
	const version = builds.map((build) => build.version).sort(compareVersions).at(-1);
	if (!version) throw new Error('No WindowTop installers found');

	return {
		version,
		urls: () =>
			builds
				.filter((build) => build.version === version)
				.map(({ url }) => (url.endsWith('.zip') ? { url, nestedInstallerMatches: ['WindowTop.exe'] } : url)),
		releaseNotes: {
			releaseNotesUrl: `https://github.com/WindowTop/WindowTop-App/releases/tag/${rawTag}`,
		},
	};
});
