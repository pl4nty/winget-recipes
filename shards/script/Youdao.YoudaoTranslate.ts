import { defineShard } from 'anthelion';
import ky from 'ky';

// The download button's link 302s to a dated CDN path (cidian/static/<major.minor>/<yymmdd>/YoudaoDictSetup.exe).
// The path names no full version, so the version comes from the installer and the path is the state.
export default defineShard(async () => {
	const res = await ky('https://cidian.youdao.com/download/YoudaoDict.exe', {
		redirect: 'manual',
		throwHttpErrors: false,
	});
	const location = res.headers.get('location');
	if (!location || !/\/cidian\/static\/[\d.]+\/\d+\/YoudaoDictSetup\.exe$/.test(location)) {
		throw new Error(`Unexpected Youdao download redirect: ${location}`);
	}
	const url = location.replace(/^http:/, 'https:');

	return {
		version: { source: 'product' },
		urls: () => [{ url, architecture: 'x86' }],
		state: url,
		releaseNotes: { releaseNotesUrl: 'https://fanyi.youdao.com/download-release-notes' },
	};
});
