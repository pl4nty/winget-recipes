import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// download.cgi?thesage redirects to the versioned installer
// (TheSage_Setup_7-76-2828.exe); the dashes in the file name become dots in
// the package version.
export default defineShard(async () => {
	const response = await fetch('https://www.sequencepublishing.com/cgi-bin/download.cgi?thesage', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = new URL(
		response.headers.get('location') ?? '',
		'https://www.sequencepublishing.com/',
	).href;
	const {
		captures: { build },
	} = match(location, /\/TheSage_Setup_(?<build>\d+(?:-\d+)+)\.exe$/i);

	return {
		version: build.replaceAll('-', '.'),
		urls: () => [location],
	};
});
