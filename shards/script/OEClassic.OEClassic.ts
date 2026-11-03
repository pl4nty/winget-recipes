import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the current versioned installer. Upstream keeps a
// four-part version (5.4.1.0), so the file version is padded with zeros. The
// release notes are the vendor news post titled with that version.
export default defineShard(async () => {
	const html = await fetch('https://www.oeclassic.com/download').then((response) => response.text());
	const {
		captures: { short },
	} = match(html, /https:\/\/www\.oeclassic\.com\/ws\/download\/oec-(?<short>\d+(?:\.\d+)+)\.exe/);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');

	const news = await fetch('https://www.oeclassic.com/news').then((response) => response.text());
	const escaped = short.replace(/\./g, '\\.');
	const post = new RegExp(`news_(n\\d+)"[^>]*>OE Classic ${escaped}<`).exec(news)?.[1];

	return {
		version: parts.join('.'),
		urls: () => [`https://www.oeclassic.com/ws/download/oec-${short}.exe`],
		releaseNotes: {
			releaseNotesUrl: post ? `https://www.oeclassic.com/news_${post}` : 'https://www.oeclassic.com/news',
		},
	};
});
