import { defineShard } from 'anthelion';
import { isStateMatching, komac } from 'anthelion/helpers';
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
	const installer = { url, architecture: 'x86' as const };
	const releaseNotes = { releaseNotesUrl: 'https://fanyi.youdao.com/download-release-notes' };

	// Anthelion skips the update on a matching state before it resolves the version
	if (await isStateMatching({ packageIdentifier: 'Youdao.YoudaoTranslate', state: url })) {
		return { version: { source: 'file' }, urls: () => [installer], state: url, releaseNotes };
	}

	// The setup exe has a FileVersion but no ProductVersion
	const { versions } = await komac.analyzeInstaller(installer);
	const version = versions.file ?? versions.product;
	if (!version) {
		throw new Error('No FileVersion or ProductVersion found in YoudaoDictSetup.exe');
	}

	return { version, urls: () => [installer], state: url, releaseNotes };
});
