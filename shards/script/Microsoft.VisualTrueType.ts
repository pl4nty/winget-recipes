import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'VisualTrueType',
		useLatestEndpoint: true,
		assetRegex: '^release_binary\\.zip$',
	});
	const platform = await fetch(
		`https://raw.githubusercontent.com/microsoft/VisualTrueType/${release.rawTag}/src/Platform.h`,
	).then((response) => response.text());

	return {
		version: match(platform, /VTTVersionString\s+L"([^"]+)"/).groups[0],
		urls: () => release.urls().map((url) => ({ url, nestedInstallerMatches: ['vttcompile.exe'] })),
	};
});
