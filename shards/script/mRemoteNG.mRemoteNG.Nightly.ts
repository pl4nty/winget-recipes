import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Nightly tags look like 20261002-v1.78.2-NB-(3725) (older ones 2023.03.03-v1.77.3-nb), packaged as 1.78.2.3725.
// The build number is not always in the tag, so it falls back to the installer asset name.
const owner = 'mRemoteNG';
const repo = 'mRemoteNG';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner, repo, kind: 'all', tagRegex: '-[Nn][Bb]\\b' });
	const installers = release.assets.filter((asset) => /installer.*\.msi$/i.test(asset.name));
	if (!installers.length) throw new Error(`No installer msi in ${release.rawTag}: ${release.assetNames().join(", ")}`);

	const base = match(release.rawTag, /v(\d+\.\d+\.\d+)/).groups[0];
	const build =
		/\((\d+)\)/.exec(release.rawTag)?.[1] ??
		match(installers[0]!.name, /(?:nb|NB)[-.]?(\d+)/, `No build number in ${installers[0]!.name}`).groups[0];

	return {
		version: `${base}.${build}`,
		urls: () => installers.map((asset) => asset.browser_download_url),
		releaseNotes: { source: 'github', owner, repo, tag: release.rawTag },
	};
});
