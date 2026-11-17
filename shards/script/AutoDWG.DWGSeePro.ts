import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page only names the yearly MSI (DWGSeePro<year>.msi) and never shows
// the product version, so the version is read from the MSI and the URL plus its ETag
// is kept as state.
export default defineShard(async () => {
	const page = await (await fetch('https://www.autodwg.com/dwg-viewer/')).text();
	const {
		groups: [url],
	} = match(page, /(https:\/\/download\.autodwg\.com\/DWGSeePro\d{4}\.msi)/, 'No DWGSee Pro MSI link found');
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`DWGSee Pro MSI returned ${response.status}`);
	const etag = response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';

	return {
		version: { source: 'product' },
		urls: () => [url],
		state: `${url} ${etag}`,
		replace: true,
	};
});
