import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Tags are three-part (v2.1.0) but upstream PackageVersion is four-part
// (2.1.0.0), so pad the tag version to four parts.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'sudo0015',
		repo: 'Lexis',
	});

	const parts = release.version.split('.');
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [`https://github.com/sudo0015/Lexis/releases/download/${release.rawTag}/Lexis.exe`],
		releaseNotes: { source: 'github', owner: 'sudo0015', repo: 'Lexis', tag: release.rawTag },
	};
});
