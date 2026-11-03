import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://www.axis.com/support/tools/axis-device-manager').then((response) => response.text());
	const {
		groups: [version],
	} = match(page, />Version (\d+\.\d+\.\d+)</);
	const base = `https://www.axis.com/ftp/pub_soft/cam_srv/adm/${version!.replaceAll('.', '_')}`;

	return {
		version: version!,
		urls: () => [`${base}/AXISDeviceManagerSetup.exe`],
		releaseNotes: {
			source: 'markdown',
			sourceUrl: `${base}/relnote.md`,
			releaseNotesUrl: `${base}/relnote.md`,
			cleanup: false,
		},
	};
});
