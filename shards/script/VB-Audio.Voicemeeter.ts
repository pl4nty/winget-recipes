import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link encodes the version as digits only (VoicemeeterSetup_v1130.zip
// is 1.1.3.0), so read the link from the product page and dot the digits.
const page = 'https://vb-audio.com/Voicemeeter/index.htm';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [url],
		captures: { digits },
	} = match(html, /(https:\/\/download\.vb-audio\.com\/Download_CABLE\/VoicemeeterSetup_v(?<digits>\d{4})\.zip)/i);

	return {
		version: digits.split('').join('.'),
		urls: () => [url],
		replace: true,
	};
});
