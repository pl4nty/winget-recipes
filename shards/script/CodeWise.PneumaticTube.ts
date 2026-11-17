import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are v<major>.<minor>[.<patch>]; upstream PackageVersion is padded to four parts (1.8 -> 1.8.0.0).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'hartez', repo: 'PneumaticTube' });
	const parts = release.rawTag.replace(/^v/, '').split('.');
	if (parts.length > 4 || parts.some((part) => !/^\d+$/.test(part))) throw new Error(`Unexpected PneumaticTube tag ${release.rawTag}`);
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [`https://github.com/hartez/PneumaticTube/releases/download/${release.rawTag}/PneumaticTube.zip`],
		releaseNotes: { source: 'github', owner: 'hartez', repo: 'PneumaticTube', tag: release.rawTag },
	};
});
