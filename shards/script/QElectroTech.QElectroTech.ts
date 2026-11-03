import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags drop the patch (0.100) and the installer name carries a git build suffix
// (Installer_QElectroTech-0.100.0_x86_64-win64+git8590-1.exe), so read the
// version and the URL from the release asset.
const installer = /\/Installer_QElectroTech-(\d+(?:\.\d+)+)_x86_64-win64[^/]*\.exe$/;

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'qelectrotech',
		repo: 'qelectrotech-source-mirror',
		useLatestEndpoint: true,
	});
	const url = release.urls().find((url) => installer.test(url));
	if (!url) throw new Error('No QElectroTech x86_64 installer in the latest release');
	const {
		groups: [version],
	} = match(url, installer);

	return {
		version,
		urls: () => [url],
		releaseNotes: {
			source: 'github',
			owner: 'qelectrotech',
			repo: 'qelectrotech-source-mirror',
			tag: release.rawTag,
		},
	};
});
