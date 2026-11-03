import { defineShard } from 'anthelion';

// The CLI zips live under hashed paths on download.warpsend.io, so the URLs
// can only come from a vendor page that links them. Upstream versions look like
// 1.0.0.<build timestamp>; the build timestamp is read from the same page.
export default defineShard(async () => {
	const page = 'https://warpsend.io/download/';
	const html = await fetch(page).then((response) => response.text());
	const x64 = html.match(
		/https:\/\/download\.warpsend\.io\/downloads\/[0-9a-f]+\/warpsend-x86_64-pc-windows-gnu\.[0-9a-f]+\.zip/,
	)?.[0];
	const arm64 = html.match(
		/https:\/\/download\.warpsend\.io\/downloads\/[0-9a-f]+\/warpsend-aarch64-pc-windows-gnullvm\.[0-9a-f]+\.zip/,
	)?.[0];
	const build = html.match(/warpsend[^"]*?(\d+\.\d+\.\d+)[-.](\d{12})[^"]*?windows/i);
	if (!x64 || !arm64 || !build) {
		throw new Error(`The Windows CLI zips or their build are not listed on ${page}`);
	}

	return {
		version: `${build[1]}.${build[2]}`,
		urls: () => [x64, arm64],
	};
});
