import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are v1.1.8.2609; asset names use the first three parts without dots
// (numere-win-v118_x64-portable.exe).
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'numere-org',
		repo: 'NumeRe',
	});

	const {
		groups: [major, minor, patch],
	} = match(release.rawTag, /^v?(\d+)\.(\d+)\.(\d+)(?:\.\d+)?$/);
	const version = release.rawTag.replace(/^v/, '');
	const short = `${major}${minor}${patch}`;

	return {
		version,
		urls: () => [
			`https://github.com/numere-org/NumeRe/releases/download/${release.rawTag}/numere-win-v${short}_x64-portable.exe`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'numere-org',
			repo: 'NumeRe',
			tag: release.rawTag,
		},
	};
});
