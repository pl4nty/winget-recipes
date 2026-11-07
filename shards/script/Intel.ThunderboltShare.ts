import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Intel's download centre page links the current TSSetup.exe under a numeric
// download id, and lists the version of that build as "(Latest)".
export default defineShard(async () => {
	const response = await fetch('https://www.intel.com/content/www/us/en/download/822291/thunderbolt-share.html');
	if (!response.ok) throw new Error(`Intel download page returned HTTP ${response.status}`);
	const html = await response.text();
	const {
		captures: { id },
	} = match(html, /downloadmirror\.intel\.com\/(?<id>\d+)\/TSSetup\.exe/, 'No TSSetup.exe link on the Intel page');
	const {
		captures: { version },
	} = match(html, /(?<version>\d+\.\d+\.\d+\.\d+)\s*\(Latest\)/, 'No latest version on the Intel page');

	return {
		version,
		urls: () => [`https://downloadmirror.intel.com/${id}/TSSetup.exe`],
	};
});
