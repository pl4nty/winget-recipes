import { defineShard } from 'anthelion';

// Vernier's download link redirects to an installer named after the marketing
// version (LoggerLite194Installer.exe), while PackageVersion is the product version
// of the installer, so the redirect target is resolved and the version is read
// from the file. The target URL plus its ETag is kept as state.
export default defineShard(async () => {
	const redirect = await fetch('https://www.vernier.com/download-logger-lite-win/', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = redirect.headers.get('location');
	if (!location || !/\/LoggerLite\d+Installer\.exe$/.test(location)) {
		throw new Error(`Unexpected Logger Lite download redirect: ${location}`);
	}
	const url = new URL(location, 'https://www.vernier.com/').href;
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`Logger Lite installer returned ${response.status}`);
	const etag = response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';

	return {
		version: { source: 'product' },
		urls: () => [url],
		state: `${url} ${etag}`,
		replace: true,
	};
});
