import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are short (v5.2) but the package version is padded to four parts (5.2.0.0).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Avazbek22',
		repo: 'DevProjex',
	});

	const parts = release.tag.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	const urls = () =>
		['x64', 'arm64'].map((arch) => {
			const url = release.urls().find((u) => u.endsWith(`/DevProjex.${release.rawTag}.win-${arch}.exe`));
			if (!url) throw new Error(`DevProjex ${arch} exe not found in ${release.rawTag}`);
			return url;
		});

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'Avazbek22',
			repo: 'DevProjex',
			tag: release.rawTag,
		},
	};
});
