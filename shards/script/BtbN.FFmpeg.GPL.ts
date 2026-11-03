import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'BtbN',
		repo: 'FFmpeg-Builds',
		kind: 'all',
		tagRegex: '^autobuild-\\d{4}-\\d{2}-\\d{2}-\\d{2}-\\d{2}$',
		assetRegex: '^ffmpeg-N-\\d+-g[0-9a-f]+-win64-gpl\\.zip$',
	});

	const { captures: date } = match(
		release.rawTag,
		/^autobuild-(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-/,
	);
	const build = match(
		release.assetNames().join('\n'),
		/^ffmpeg-(N-\d+-g[0-9a-f]+)-win64-gpl\.zip$/m,
	).groups[0];

	const base = `https://github.com/BtbN/FFmpeg-Builds/releases/download/${release.rawTag}`;
	return {
		version: `${build}-${date.year}${date.month}${date.day}`,
		urls: () => [
			`${base}/ffmpeg-${build}-win64-gpl.zip`,
			`${base}/ffmpeg-${build}-winarm64-gpl.zip`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'BtbN',
			repo: 'FFmpeg-Builds',
			tag: release.rawTag,
		},
	};
});
