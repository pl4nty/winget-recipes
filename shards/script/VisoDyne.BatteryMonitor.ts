import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor reuses one release tag (`Setup`) and puts the version only in the asset name.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'VisoDyne',
		repo: 'VisoDyneBatteryMonitor',
		tag: 'Setup',
	});
	const asset = release.assets.find((a) => /^VisoDyneBatteryMonitorSetup-\d+(?:\.\d+)*-win64\.exe$/.test(a.name));
	if (!asset) throw new Error('No VisoDyneBatteryMonitorSetup-<version>-win64.exe asset on the Setup release');
	const version = asset.name.replace(/^VisoDyneBatteryMonitorSetup-/, '').replace(/-win64\.exe$/, '');

	return {
		version,
		// Upstream lists the same exe twice: user scope (/CURRENTUSER) and machine scope (/ALLUSERS).
		urls: () => [asset.browser_download_url, asset.browser_download_url],
	};
});
