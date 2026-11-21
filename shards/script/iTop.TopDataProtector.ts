import { defineShard } from 'anthelion';

// The download link serves the installer without ETag or Last-Modified, so the installer's hash is the state.
const URL = 'https://www.itopvpn.com/downloadtdp';

export default defineShard(async () => {
	const installer = await fetch(URL).then((response) => response.arrayBuffer());
	const digest = await crypto.subtle.digest('SHA-256', installer);
	const state = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

	return {
		version: { source: 'product' },
		urls: () => [URL],
		state,
		releaseNotes: { releaseNotesUrl: 'https://www.itopvpn.com/top-data-protector/' },
		replace: true,
	};
});
