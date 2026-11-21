import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream keeps the leading v in PackageVersion (v2.10.0), which JSON shards strip.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({
		owner: 'Heniokhos-Systems',
		repo: 'KernRift',
	});
	const base = `https://github.com/Heniokhos-Systems/KernRift/releases/download/${rawTag}`;

	return {
		version: rawTag,
		urls: () => [`${base}/krc-windows-x86_64.zip`, `${base}/krc-windows-arm64.zip`],
		releaseNotes: {
			source: 'github',
			owner: 'Heniokhos-Systems',
			repo: 'KernRift',
			tag: rawTag,
		},
	};
});
