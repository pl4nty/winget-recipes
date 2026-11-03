import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The home page names the current release ("VOICEATTACK VERSION v2.2 64-bit NOW"),
// and /currentinstaller redirects to an unversioned filesend URL for that build.
// That version's entry in the change log becomes the release notes: it is passed
// to the plain-text source as a data: URL so the older entries are left out.
const changes = 'https://voiceattack.com/changes.aspx';

export default defineShard(async () => {
	const page = await fetch('https://voiceattack.com/').then((response) => response.text());
	const version = match(page, /VOICEATTACK VERSION v(\d+(?:\.\d+)+) 64-bit NOW/i).groups[0];

	const response = await fetch('https://voiceattack.com/currentinstaller/', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location');
	if (!location) throw new Error('No redirect for the current installer');

	const changelog = await fetch(changes).then((response) => response.text());
	const {
		captures: { entry },
	} = match(
		changelog,
		new RegExp(`\\nv${version.replaceAll('.', '\\.')}[ \\t]*\\r?\\n(?<entry>[\\s\\S]*?)(?=\\nv\\d+(?:\\.\\d+)+[ \\t]*\\r?\\n|</pre>)`),
	);

	return {
		version,
		urls: () => [new URL(location, 'https://voiceattack.com/').href],
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: `data:text/plain,${encodeURIComponent(entry.replaceAll('\r\n', '\n').trim())}`,
			releaseNotesUrl: `${changes}#:~:text=v${version}`,
			cleanup: false,
		},
	};
});
