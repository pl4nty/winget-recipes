import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor site blocks automated clients and the URL is unversioned. The installer is a ZIP
// self-extractor whose stored (uncompressed) version.ini sits near the end of the file, so read the
// last 64 KiB. version.ini holds either 1.0.2.2 or 2.073; WinGet uses the 1.022 form.
export default defineShard(async () => {
	const url = 'https://kurtzimmermann.com/files/SimilarImagesFinder.exe';
	const tail = await fetch(url, { headers: { Range: 'bytes=-65536' } }).then((response) => response.text());
	const {
		groups: [raw],
	} = match(tail, /\[Version\]\s*version=(\d+(?:\.\d+)+)/i, 'No version.ini found in installer');
	const [major, ...rest] = raw.split('.');
	const version = rest.length === 1 ? raw : `${major}.${rest.join('')}`;

	return {
		version,
		urls: () => [url],
	};
});
