import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download links carry only the product year (flexipdf<year>_32.exe); the revision is in the installer.
export default defineShard(async () => {
	const page = await fetch('https://www.softmaker.com/en/products/flexipdf/download').then((response) => response.text());
	const {
		captures: { year },
	} = match(page, /softmaker\.net\/down\/flexipdf(?<year>\d{4})_32\.exe/, 'No FlexiPDF download link found');
	const x86 = `https://www.softmaker.net/down/flexipdf${year}_32.exe`;
	const x64 = `https://www.softmaker.net/down/flexipdf${year}_64.exe`;
	const response = await fetch(x64, { method: 'HEAD' });
	const etag = response.headers.get('etag');
	if (!etag) throw new Error(`No ETag for ${x64}`);

	return {
		version: { source: 'display' },
		state: etag,
		urls: () => [x86, x64],
		replace: true,
	};
});
