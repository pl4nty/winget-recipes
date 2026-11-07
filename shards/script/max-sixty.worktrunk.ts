import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// winget-pkgs keeps the leading v in PackageVersion, which JSON shards strip.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({ owner: 'max-sixty', repo: 'worktrunk' });

	return {
		version: release.rawTag,
		urls: () => [
			`https://github.com/max-sixty/worktrunk/releases/download/${release.rawTag}/worktrunk-x86_64-pc-windows-msvc.zip`,
		],
		releaseNotes: { source: 'github', owner: 'max-sixty', repo: 'worktrunk', tag: release.rawTag },
	};
});
