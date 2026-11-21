import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link redirects to j5create-YY.MM.DDDD.BUILD.exe; the package version drops the build and leading zeros.
export default defineShard(async () => {
	const response = await fetch('https://download.j5create.com/driver/USB_Display_Adapters_Windows_Driver/download.php', {
		redirect: 'manual',
	});
	const location = response.headers.get('location');
	if (!location) throw new Error(`No installer redirect for the j5create display driver (HTTP ${response.status})`);
	const url = new URL(location, 'https://download.j5create.com/driver/USB_Display_Adapters_Windows_Driver/').href;
	const {
		groups: [year, month, day],
	} = match(url, /\/j5create-(\d+)\.(\d+)\.(\d+)\.\d+\.exe$/i, `Unexpected installer URL ${url}`);

	return {
		version: [year, month, day].map(Number).join('.'),
		urls: () => [url],
	};
});
