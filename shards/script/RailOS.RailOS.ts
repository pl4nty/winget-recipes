import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// The package version keeps the release tag's leading v (v2.23.4), which JSON shards remove.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'Railway-Op-Sim',
		repo: 'RailOS-Inno-Setup',
	});

	return {
		version: release.rawTag,
		urls: () => [
			`https://github.com/Railway-Op-Sim/RailOS-Inno-Setup/releases/download/${release.rawTag}/RailOS-x64.exe`,
			`https://github.com/Railway-Op-Sim/RailOS-Inno-Setup/releases/download/${release.rawTag}/RailOS-x86.exe`,
		],
	};
});
