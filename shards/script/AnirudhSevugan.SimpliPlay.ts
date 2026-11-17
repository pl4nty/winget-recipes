import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// The vendor publishes the version on a `release-<a.b.c.d>` release and the winget installers on a
// separate `winget-<n>` release whose tag carries no version, so both releases are read here.
export default defineShard(async () => {
	const owner = 'A-Star100';
	const repo = 'simpliplay-desktop';
	const release = await getLatestRelease({ owner, repo, tagRegex: '^release-(?=\\d+(?:\\.\\d+){3}$)' });
	const winget = await getLatestRelease({ owner, repo, tagRegex: '^winget-(?=\\d+$)' });
	const version = release.version;

	const titleVersion = `${winget.title ?? ''}`.match(/\d+(?:\.\d+)+/)?.[0];
	if (titleVersion && titleVersion !== version && `${titleVersion}.0` !== version) {
		throw new Error(`Latest winget release ${winget.rawTag} (${titleVersion}) does not match ${release.rawTag}`);
	}

	return {
		version,
		urls: () =>
			['x64', 'arm64'].map((arch) => {
				const name = `SimpliPlay-${arch}-winget-setup.exe`;
				const asset = winget.assets.find((a) => a.name === name);
				if (!asset) throw new Error(`No ${name} asset on ${winget.rawTag}`);
				return asset.browser_download_url;
			}),
		releaseNotes: { source: 'github', owner, repo, tag: release.rawTag, cleanup: false },
	};
});
