import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are vYYYY.MM.DD with an optional build (v2026.02.08.13); the package
// version is YYYY.MMDD.build (2026.208.13, 2026.1018.0).
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'wrzonance',
		repo: 'WrzDJ',
	});

	const {
		groups: [year, month, day, build],
	} = match(release.rawTag, /^v?(\d{4})\.(\d{2})\.(\d{2})(?:\.(\d+))?$/);
	const version = `${year}.${Number(month) * 100 + Number(day)}.${Number(build ?? 0)}`;

	return {
		version,
		urls: () => [`https://github.com/wrzonance/WrzDJ/releases/download/${release.rawTag}/WrzDJ-Bridge.exe`],
		releaseNotes: {
			source: 'github',
			owner: 'wrzonance',
			repo: 'WrzDJ',
			tag: release.rawTag,
		},
	};
});
