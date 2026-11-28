import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags drop the 4-part package version (0.9.3 vs 0.9.3.0); the Msixbundle name carries it.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'ModernFlyouts-Community', repo: 'ModernFlyouts', kind: 'stable' });
	const asset = release.assets.find((a) => /^32669SamG\.ModernFlyouts_\d+(?:\.\d+)+_neutral_.*\.msixbundle$/i.test(a.name));
	if (!asset) throw new Error(`No Msixbundle asset on ${release.rawTag}`);
	const version = asset.name.match(/_(\d+(?:\.\d+)+)_neutral_/i)![1]!;

	return {
		version,
		urls: () => [{ url: asset.browser_download_url, architecture: 'x64' as const }],
		releaseNotes: { releaseNotesUrl: `https://github.com/ModernFlyouts-Community/ModernFlyouts/releases/tag/${release.rawTag}` },
	};
});
