import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Release tags drop the build (2.4.2), but the MSI name and winget-pkgs carry the four-part version
// (2.4.2.3). A release can hold several builds, so take the newest Avalonia MSI in it.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'GiulianoSpaghetti', repo: 'CBriscola.Material', useLatestEndpoint: true });
	const version = release
		.assetNames()
		.flatMap((name) => /^CBriscola\.Avalonia-(\d+(?:\.\d+)+)-material-amd64\.msi$/i.exec(name)?.[1] ?? [])
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No CBriscola.Avalonia x64 MSI found');

	return {
		version,
		urls: () => [
			`https://github.com/GiulianoSpaghetti/CBriscola.Material/releases/download/${release.rawTag}/CBriscola.Avalonia-${version}-material-amd64.msi`,
		],
		releaseNotes: { source: 'github', owner: 'GiulianoSpaghetti', repo: 'CBriscola.Material', tag: release.rawTag, cleanup: false },
	};
});
