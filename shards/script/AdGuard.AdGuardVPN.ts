import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged with the product version (v2.9.0) while the package is
// versioned with the build number from the asset name
// (AdGuardVpn-2.9.0-.2004.exe -> 2.9.2004.0). The one installer serves both
// x64 and x86.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'AdguardTeam',
		repo: 'AdGuardVPNForWindows',
	});

	const [url] = release.urls().filter((url) => /\/AdGuardVpn-[\d.]+-\.\d+\.exe$/i.test(url));
	const {
		groups: [major, minor, build],
	} = match(url, /AdGuardVpn-(\d+)\.(\d+)\.\d+-\.(\d+)\.exe$/i);
	const arm64 = release.urls().filter((url) => /arm64.*\.exe$/i.test(url));

	return {
		version: `${major}.${minor}.${build}.0`,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url, architecture: 'x86' },
			...arm64.map((url) => ({ url, architecture: 'arm64' as const })),
		],
		releaseNotes: { source: 'github', owner: 'AdguardTeam', repo: 'AdGuardVPNForWindows', tag: release.rawTag },
	};
});
