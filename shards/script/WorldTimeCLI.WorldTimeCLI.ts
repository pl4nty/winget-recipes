import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream writes release tag vX.Y.Z as PackageVersion X.Y.0.Z (v1.0.2 is 1.0.0.2).
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'Nurbek1998', repo: 'WorldTimeCLI' });
	const parts = /^v(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/.exec(rawTag)?.groups;
	if (!parts) throw new Error(`Unexpected WorldTimeCLI tag ${rawTag}`);

	return {
		version: `${parts.major}.${parts.minor}.0.${parts.patch}`,
		urls: () => [`https://github.com/Nurbek1998/WorldTimeCLI/releases/download/${rawTag}/wtc.exe`],
		releaseNotes: { source: 'github', owner: 'Nurbek1998', repo: 'WorldTimeCLI', tag: rawTag },
	};
});
