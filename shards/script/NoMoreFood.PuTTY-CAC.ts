import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged like 0.85 or 0.85u2 (PuTTY version + CAC update number);
// the package version is the four-part 0.85.0.0 / 0.85.2.0.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({
		owner: 'NoMoreFood',
		repo: 'putty-cac',
	});

	const {
		groups: [major, minor, update],
	} = match(rawTag, /^(\d+)\.(\d+)(?:u(\d+))?$/);

	const base = `https://github.com/NoMoreFood/putty-cac/releases/download/${rawTag}/puttycac-${rawTag}`;

	return {
		version: `${major}.${minor}.${update ?? '0'}.0`,
		urls: () => [`${base}-x64.msi`, `${base}-x86.msi`, `${base}-arm64.msi`],
		releaseNotes: {
			source: 'github',
			owner: 'NoMoreFood',
			repo: 'putty-cac',
			tag: rawTag,
		},
	};
});
