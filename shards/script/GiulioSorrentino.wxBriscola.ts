import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged 0.6.4 while the MSIs carry the full version, e.g.
// wxBriscola-0.6.4.1-amd64.msi, which is the package version.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'GiulianoSpaghetti',
		repo: 'wxBriscola-for-Windows',
	});
	const names = release.assetNames();
	const amd64 = names.find((name) => /^wxBriscola-[\d.]+-amd64\.msi$/.test(name));
	const {
		groups: [version],
	} = match(amd64, /^wxBriscola-([\d.]+)-amd64\.msi$/, 'No amd64 MSI in latest release');
	const base = `https://github.com/GiulianoSpaghetti/wxBriscola-for-Windows/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [`${base}/wxBriscola-${version}-amd64.msi`, `${base}/wxBriscola-${version}-arm64.msi`],
		releaseNotes: { source: 'github', owner: 'GiulianoSpaghetti', repo: 'wxBriscola-for-Windows', tag: release.rawTag },
	};
});
