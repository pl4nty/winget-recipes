import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Tags are v<major>.<minor> (e.g. v2.2) but the package version is padded to
// four parts (2.2.0.0); the asset names keep the raw tag.
export default defineShard(async () => {
	const { tag, rawTag } = await getLatestReleaseFromRedirect({
		owner: 'Avazbek22',
		repo: 'OmenGamingHubUnlocker',
	});

	const parts = tag.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => [
			`https://github.com/Avazbek22/OmenGamingHubUnlocker/releases/download/${rawTag}/OmenGamingHubUnlocker-${rawTag}-win-x64.exe`,
			`https://github.com/Avazbek22/OmenGamingHubUnlocker/releases/download/${rawTag}/OmenGamingHubUnlocker-${rawTag}-win-arm64.exe`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'Avazbek22',
			repo: 'OmenGamingHubUnlocker',
			tag: rawTag,
		},
	};
});
