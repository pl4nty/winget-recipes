import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Release tags (v2.1.0.0) don't match the bundle version (2.1.4.0), and anthelion's asset filter skips .AppxBundle.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'dongle-the-gadget', repo: 'WinverUWP' });
	const asset = release.assets.find((a) => /^2505FireCubeStudios\.WinverUWP_\d+(?:\.\d+)+_neutral_\._k45w5yt88e21j\.AppxBundle$/i.test(a.name));
	if (!asset) throw new Error('No WinverUWP .AppxBundle asset on the latest release');
	const version = /_(\d+(?:\.\d+)+)_neutral_/.exec(asset.name)![1]!;

	return {
		version,
		urls: () => [asset.browser_download_url],
	};
});
