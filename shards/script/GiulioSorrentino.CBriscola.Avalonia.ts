import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags drop the build (2.4.2), but the MSI name and winget-pkgs carry the four-part version
// (2.4.2.3), so read the version from the latest release's Avalonia MSI name.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'GiulianoSpaghetti', repo: 'CBriscola.Material', useLatestEndpoint: true });
	const {
		captures: { version },
	} = match(
		release.assetNames().join('\n'),
		/^CBriscola\.Avalonia-(?<version>\d+(?:\.\d+)+)-material-amd64\.msi$/im,
		'No CBriscola.Avalonia x64 MSI found',
	);

	return {
		version,
		urls: () => [
			`https://github.com/GiulianoSpaghetti/CBriscola.Material/releases/download/${release.rawTag}/CBriscola.Avalonia-${version}-material-amd64.msi`,
		],
		releaseNotes: { source: 'github', owner: 'GiulianoSpaghetti', repo: 'CBriscola.Material', tag: release.rawTag, cleanup: false },
	};
});
