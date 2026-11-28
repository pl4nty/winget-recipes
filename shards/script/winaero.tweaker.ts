import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The download URL never changes; the product page states the current version
// and links its release notes. winget uses four-part versions (1.65 -> 1.65.0.0).
export default defineShard(async () => {
	const page = await ky('https://winaero.com/winaero-tweaker/').text();
	const {
		groups: [shortVersion],
	} = match(page, /The latest version is (?:<[^>]+>)*(\d+(?:\.\d+)+)/);
	const parts = shortVersion!.split('.');
	while (parts.length < 4) parts.push('0');
	const version = parts.join('.');

	const notes = new RegExp(
		`<p>${shortVersion!.replaceAll('.', '\\.')}</p><p>(?:[^<]|<(?!/p>))*?href="([^"]+)"`,
	).exec(page)?.[1];

	return {
		version,
		urls: () => [
			{ url: 'https://winaerotweaker.com/download/winaerotweaker.zip', architecture: 'x86' },
			{ url: 'https://winaerotweaker.com/download/winaerotweaker.zip', architecture: 'x64' },
		],
		releaseNotes: {
			releaseNotesUrl: notes
				? new URL(notes, 'https://winaero.com/').href
				: `https://winaero.com/winaero-tweaker-${shortVersion!.replaceAll('.', '-')}-released/`,
		},
	};
});
