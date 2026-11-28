import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The only download is unversioned and its NSIS DisplayVersion carries a "v" prefix,
// so read the version from the ProductName resource ("VoiceKey v2.105.0") instead.
const url = 'https://app.voicehotkey.com/releases/win/VoiceKeySetup.exe';

export default defineShard(async () => {
	const buffer = await fetch(url).then((response) => response.arrayBuffer());
	const text = new TextDecoder('utf-16le').decode(buffer);
	const {
		groups: [version],
	} = match(text, /VoiceKey v(\d+(?:\.\d+)+)\0/i, 'No VoiceKey version in the installer resources');

	return {
		version,
		urls: () => [url],
		releaseNotes: { releaseNotesUrl: 'https://voicehotkey.com' },
	};
});
