import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'diskuv', repo: 'dk', tagRegex: '-signed$', perPage: 100 });

	return {
		version: release.version,
		urls: () => [
			{ url: `https://diskuv.com/a/dk-exe/${release.rawTag}/dk-windows_x86_64.exe`, architecture: 'x64' },
			{ url: `https://diskuv.com/a/dk-exe/${release.rawTag}/dk-windows_x86.exe`, architecture: 'x86' },
		],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/diskuv/dk/releases/tag/${release.rawTag}`,
		},
	};
});
