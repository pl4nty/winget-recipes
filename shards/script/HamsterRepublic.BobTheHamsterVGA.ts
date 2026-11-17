import { defineShard } from 'anthelion';

// The installer has no version resource; upstream versions it by its release date (YYYY-MM-DD),
// which the vendor server reports as the file's Last-Modified date.
export default defineShard(async () => {
	const url = 'https://hamsterrepublic.com/dl/bobvga-installer.exe';
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
	const lastModified = response.headers.get('last-modified');
	if (!lastModified) throw new Error(`No last-modified header for ${url}`);
	const version = new Date(lastModified).toISOString().slice(0, 10);

	return {
		version,
		urls: () => [url],
	};
});
