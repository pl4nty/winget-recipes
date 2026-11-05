import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Releases are tagged 0.6.4 while the MSIs carry the full version, e.g.
// wxBriscola-0.6.4.1-amd64.msi, which is the package version. A release can
// hold several builds (0.6.4 and 0.6.4.1), so take the newest amd64 MSI.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'GiulianoSpaghetti',
		repo: 'wxBriscola-for-Windows',
	});
	const versions = release
		.assetNames()
		.map((name) => /^wxBriscola-(\d+(?:\.\d+)+)-amd64\.msi$/.exec(name)?.[1])
		.filter((version): version is string => !!version)
		.sort(compareVersions);
	const version = versions.at(-1);
	if (!version) throw new Error('No amd64 MSI in latest release');
	const base = `https://github.com/GiulianoSpaghetti/wxBriscola-for-Windows/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [`${base}/wxBriscola-${version}-amd64.msi`, `${base}/wxBriscola-${version}-arm64.msi`],
		releaseNotes: { source: 'github', owner: 'GiulianoSpaghetti', repo: 'wxBriscola-for-Windows', tag: release.rawTag },
	};
});
