import { defineShard } from 'anthelion';

// sigrok publishes the PulseView nightly under one fixed URL and the package
// tracks it under the channel name, taken from that file name; the ETag tells
// when a new build lands.
const url = 'https://sigrok.org/download/binary/pulseview/pulseview-NIGHTLY-x86_64-release-installer.exe';

export default defineShard(async () => {
	const response = await fetch(url, { method: 'HEAD' });
	const etag = response.headers.get('etag');
	if (!response.ok || !etag) throw new Error(`No ETag for ${url}`);
	const channel = /pulseview-([A-Z]+)-/.exec(url)![1]!.toLowerCase();

	return {
		version: channel,
		state: etag,
		urls: () => [url],
		replace: true,
	};
});
