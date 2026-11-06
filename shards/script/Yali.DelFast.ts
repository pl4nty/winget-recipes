import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'TheYali1', repo: 'DelFast', tagRegex: '^v' });
	// Upstream pads the tag (v1.2) to four parts (1.2.0.0).
	const parts = release.rawTag.replace(/^v/i, '').split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => [`https://github.com/TheYali1/DelFast/releases/download/${release.rawTag}/DelFast.exe`],
		releaseNotes: { source: 'github', owner: 'TheYali1', repo: 'DelFast', tag: release.rawTag },
	};
});
