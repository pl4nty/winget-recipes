import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

export default defineShard(async () => {
	const { rawTag, urls } = await getLatestRelease({
		owner: 'coronalabs',
		repo: 'corona',
		assetRegex: '^Solar2D-Windows-\\d{4}\\.\\d+\\.msi$',
	});
	const [url] = urls();
	// Upstream versions are <two-digit build year>.0.<build>.
	const [, year, build] = /-20(\d{2})\.(\d+)\.msi$/.exec(url ?? '') ?? [];
	if (!url || !year) throw new Error('No Solar2D Windows installer found');

	return {
		version: `${year}.0.${build}`,
		urls: () => [{ url, architecture: 'neutral' }],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/coronalabs/corona/releases/tag/${rawTag}`,
		},
	};
});
