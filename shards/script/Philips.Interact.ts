import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// PPDS hosts the Interact client on DatoCMS with an upload timestamp in the
// file name, so the whole URL is taken from the vendor's downloads API.
// The file name spells the version with dashes (v7-5-611).
export default defineShard(async () => {
	const page = 'https://www.ppds.com/api/downloads?locale=en';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { url, version },
	} = match(
		html,
		/(?<url>https:\/\/www\.datocms-assets\.com\/\d+\/\d+-interact-client-for-windows_v(?<version>\d+(?:-\d+)+)-exe\.exe)/i,
	);

	return {
		version: version.replaceAll('-', '.'),
		urls: () => [url],
	};
});
