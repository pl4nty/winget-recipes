import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The home page names the current release ("VOICEATTACK VERSION v2.2 64-bit NOW"),
// and /currentinstaller redirects to an unversioned filesend URL for that build.
export default defineShard(async () => {
	const page = await fetch('https://voiceattack.com/').then((response) => response.text());
	const version = match(page, /VOICEATTACK VERSION v(\d+(?:\.\d+)+) 64-bit NOW/i).groups[0];

	const response = await fetch('https://voiceattack.com/currentinstaller/', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location');
	if (!location) throw new Error('No redirect for the current installer');

	return {
		version,
		urls: () => [new URL(location, 'https://voiceattack.com/').href],
		releaseNotes: {
			releaseNotesUrl: `https://voiceattack.com/changes.aspx#:~:text=v${version}`,
		},
	};
});
