import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags carry the build number (v4.5.28.3936), but the installer asset is named
// after the first three parts only (Rainmeter-4.5.28.exe).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'rainmeter', repo: 'rainmeter' });
	const short = match(release.version, /^(\d+\.\d+\.\d+)/).groups[0];

	return {
		version: release.version,
		urls: () => [
			`https://github.com/rainmeter/rainmeter/releases/download/${release.rawTag}/Rainmeter-${short}.exe`,
		],
		releaseNotes: { source: 'github', owner: 'rainmeter', repo: 'rainmeter', tag: release.rawTag },
	};
});
