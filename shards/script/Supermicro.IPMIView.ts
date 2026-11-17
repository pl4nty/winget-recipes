import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download center lists the Windows build as a software item id; getfile.php redirects
// that id to the versioned zip, whose name also carries the build date of the nested installer.
export default defineShard(async () => {
	const page = await fetch('https://www.supermicro.com/en/support/resources/downloadcenter/smsdownload?category=IPMI').then(
		(response) => response.text(),
	);
	const {
		captures: { id },
	} = match(
		page,
		/data-sms-name="Windows" id="sms_radio_\d+" name="sms_radio_buttons_IPMIView_\d+(?:\.\d+)+" value="(?<id>\d+)"/,
		'No IPMIView Windows download found',
	);
	const response = await fetch(
		`https://www.supermicro.com/support/resources/getfile.php?SoftwareItemID=${id}&type=serversoftwarefile`,
		{ redirect: 'manual' },
	);
	const location = new URL(response.headers.get('location') ?? '', 'https://www.supermicro.com').href;
	const {
		captures: { version, build },
	} = match(
		location,
		/\/Bios\/sw_download\/\d+\/IPMIView_(?<version>\d+(?:\.\d+)+)_build\.(?<build>\d+)_Windows\.zip$/,
		'Unexpected IPMIView download URL',
	);

	return {
		version,
		urls: () => [
			{ url: location, architecture: 'neutral', nestedInstallerMatches: [`IPMIView_${version}_build.${build}_Windows.exe`] },
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.supermicro.com/en/support/resources/downloadcenter/smsdownload?category=IPMI',
		},
	};
});
