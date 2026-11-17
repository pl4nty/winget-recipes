import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// TP-Link lists the utility without a version and stores each upload under a dated
// path, so the current link is read from a product support page and the version is
// read from the installer inside the zip. The URL plus its ETag is kept as state.
export default defineShard(async () => {
	const page = await (await fetch('https://www.tp-link.com/us/support/download/archer-c7/v5/')).text();
	const {
		groups: [url],
	} = match(
		page,
		/(https:\/\/static\.tp-link\.com\/upload\/software\/[\d/]+\/USB_Printer_Controller_Utility_Windows\.zip)/,
		'No USB Printer Controller Utility link found',
	);
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`USB Printer Controller Utility returned ${response.status}`);
	const etag = response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';

	return {
		version: { source: 'product' },
		urls: () => [{ url, nestedInstallerMatches: ['setup.exe'] }],
		state: `${url} ${etag}`,
		replace: true,
	};
});
