import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer URL is unversioned, so the version comes from the trial
// installer button on the product page. Upstream keeps a four-part version,
// so the three-part page version is padded with zeros.
export default defineShard(async () => {
	const html = await fetch('https://www.thegrideon.com/access-forensics.html').then((response) =>
		response.text(),
	);
	const {
		captures: { short },
	} = match(
		html,
		/accessforensics\.exe[\s\S]*?<span itemprop="version">(?<short>\d+(?:\.\d+)+)<\/span>/,
	);
	const parts = short.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	return {
		version,
		urls: () => ['https://www.thegrideon.com/download/accessforensics.exe'],
	};
});
