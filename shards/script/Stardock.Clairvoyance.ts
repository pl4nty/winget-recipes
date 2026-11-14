import { defineShard } from 'anthelion';

// Clairvoyance's release API has one latest release per platform. The arm64
// build can land a few hours after x64, so it is only added once its version
// (reported as "<version>-arm64") matches the x64 release.
const api = 'https://www.clairvoyanceai.com/api/releases/latest?platform=';

type Release = { version: string; download_url: string; is_prerelease: boolean };

const latest = (platform: string): Promise<Release> =>
	fetch(`${api}${platform}`).then((response) => response.json() as Promise<Release>);

export default defineShard(async () => {
	const [x64, arm64] = await Promise.all([latest('windows'), latest('windows-arm64')]);
	const version = x64.version;
	const urls = [{ url: x64.download_url, architecture: 'x64' as const }];
	if (arm64.version.replace(/-arm64$/, '') === version) {
		urls.push({ url: arm64.download_url, architecture: 'arm64' as const });
	}

	return {
		version,
		urls: () => urls,
		replace: true,
	};
});
