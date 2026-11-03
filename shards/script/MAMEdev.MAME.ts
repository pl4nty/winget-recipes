import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// MAME tags releases as mame0289; the package version is 0.289.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'mamedev',
		repo: 'mame',
		tagRegex: '^mame(?=\\d+$)',
	});

	const {
		groups: [build],
	} = match(release.rawTag, /^mame(\d+)$/);
	const version = `${Number.parseInt(build.slice(0, 1), 10)}.${build.slice(1)}`;
	const url = (arch: string) => `https://github.com/mamedev/mame/releases/download/${release.rawTag}/${release.rawTag}b_${arch}.exe`;

	return {
		version,
		urls: () => [url('x64'), url('arm64')],
		releaseNotes: {
			releaseNotesUrl: `https://www.mamedev.org/releases/whatsnew_${build}.txt`,
		},
	};
});
