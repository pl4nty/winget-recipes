import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The MSI name carries the product year (DWGSeeCAD2027.msi) and the page shows
// no version, so take the linked MSI and read the version from it. AutoDWG
// ships only an x64 MSI since the 2027 edition.
export default defineShard(async () => {
	const page = await fetch('https://www.dwgsee.com/download.html').then((response) => response.text());
	const {
		captures: { file },
	} = match(page, /https:\/\/download\.autodwg\.com\/(?<file>DWGSeeCAD\d{4}\.msi)/, 'No DWGSee CAD MSI link found');
	const url = `https://download.autodwg.com/${file}`;
	const response = await fetch(url, { method: 'HEAD' });

	return {
		version: { source: 'display' },
		urls: () => [url],
		state: response.headers.get('last-modified') ?? '',
		replace: true,
	};
});
