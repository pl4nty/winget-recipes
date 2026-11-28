import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags look like v26.02-v1.5.7-R2 (7-Zip version, zstd version, revision), and the
// installer names carry only the 7-Zip part (7z26.02-zstd-x64.exe).
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'mcmilk', repo: '7-Zip-zstd' });
	const version = release.rawTag.replace(/^v/, '');
	const sevenZip = match(version, /^(\d+\.\d+)-v/).groups[0];
	const base = `https://github.com/mcmilk/7-Zip-zstd/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			`${base}/7z${sevenZip}-zstd-x86.exe`,
			`${base}/7z${sevenZip}-zstd-x64.exe`,
			`${base}/7z${sevenZip}-zstd-arm64.exe`,
		],
		releaseNotes: { source: 'github', owner: 'mcmilk', repo: '7-Zip-zstd', tag: release.rawTag },
	};
});
