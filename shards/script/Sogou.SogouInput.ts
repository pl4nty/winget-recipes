import { defineShard } from 'anthelion';
import ky from 'ky';

export default defineShard(async () => {
	// The vendor page embeds its download links as escaped JSON; "normal" under "windows" is the PC installer
	const page = await ky('https://shurufa.sogou.com/').text();
	const link = /\\?"normal\\?":\\?"(https?:\/\/ime\.gtimg\.com\/pc\/sogou_pinyin_[\d.]+\.exe)\\?",\\?"name\\?":\\?"windows\\?"/.exec(page)?.[1];
	if (!link) {
		throw new Error('No Windows download link found on the Sogou page');
	}
	const url = link.replace(/^http:/, 'https:');

	const state = (await ky.head(url)).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	// One installer serves every architecture, as in the upstream manifest
	return {
		version: { source: 'product' },
		urls: () => (['x86', 'x64', 'arm64'] as const).map((architecture) => ({ url, architecture })),
		state,
		releaseNotes: { releaseNotesUrl: 'https://pinyin.sogou.com/changelog.php' },
	};
});
