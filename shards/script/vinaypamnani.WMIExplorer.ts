import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are zero-padded dates (v2026.01.05.01), but the package version drops
// the leading zeros (2026.1.5.1).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'vinaypamnani',
		repo: 'wmie',
	});

	const { groups } = match(release.rawTag, /^v?(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	const version = groups.map((part) => String(Number(part))).join('.');

	const urls = () => release.urls().filter((url) => /\/WmiExplorer-[\d.]+\.zip$/.test(url));

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'vinaypamnani',
			repo: 'wmie',
			tag: release.rawTag,
		},
	};
});
