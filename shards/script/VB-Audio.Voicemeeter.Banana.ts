import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link encodes the version as digits only (VoicemeeterSetup_v2130.zip
// is 2.1.3.0), so read the link from the product page and dot the digits.
const page = 'https://vb-audio.com/Voicemeeter/banana.htm';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [url],
		captures: { digits },
	} = match(
		html,
		/(https:\/\/download\.vb-audio\.com\/Download_CABLE\/VoicemeeterSetup_v(?<digits>\d{4})\.zip)/i,
	);

	// One zip serves both architectures, as upstream lists it.
	return {
		version: digits!.split('').join('.'),
		urls: () => [
			{ url: url!, architecture: 'x64' },
			{ url: url!, architecture: 'x86' },
		],
	};
});
