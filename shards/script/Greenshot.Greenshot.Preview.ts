import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Continuous builds are GitHub prereleases tagged v<major>.<minor>.<build>-g<commit>.
// Upstream PackageVersion keeps only <major>.<minor>.<build> (1.3.277), so the commit hash is dropped.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'greenshot', repo: 'greenshot', kind: 'prerelease' });
	const build = release.rawTag.replace(/^v/, '');
	const version = build.replace(/-g[0-9a-f]+$/, '');
	if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Unexpected Greenshot tag ${release.rawTag}`);

	return {
		version,
		urls: () => [`https://github.com/greenshot/greenshot/releases/download/${release.rawTag}/Greenshot-INSTALLER-${build}-UNSTABLE-UNSIGNED.exe`],
		releaseNotes: { source: 'github', owner: 'greenshot', repo: 'greenshot', tag: release.rawTag, cleanup: false },
	};
});
