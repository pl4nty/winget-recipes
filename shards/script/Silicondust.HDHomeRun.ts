import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links an unversioned URL that redirects to a dated installer
// (hdhomerun_windows_YYYYMMDD.exe). The package version is the installer's product
// version, so read it from the installer and use the redirect target as the state.
export default defineShard(async () => {
	const response = await fetch('https://download.silicondust.com/hdhomerun/hdhomerun_windows.exe', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const url = match(
		location,
		/^(https:\/\/download\.silicondust\.com\/hdhomerun\/hdhomerun_windows_\d{8}\.exe)$/,
		`Unexpected HDHomeRun redirect: ${location}`,
	).groups[0];

	return { version: { source: 'product' }, urls: () => [url], state: url };
});
