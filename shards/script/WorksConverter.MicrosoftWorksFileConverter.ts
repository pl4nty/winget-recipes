import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release notes page names the current public release, and each release has its
// own <section> with an <h2> version heading; that section's list is passed as the notes.
export default defineShard(async () => {
	const page = 'https://worksconverter.com/release-notes';
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /The current public release is <strong[^>]*>(?<version>\d+(?:\.\d+)+)<\/strong>/);
	const {
		captures: { notes },
	} = match(
		html,
		new RegExp(`<h2[^>]*>${version.replaceAll('.', '\\.')}</h2>[\\s\\S]*?</div>(?<notes>[\\s\\S]*?)</section>`),
	);

	return {
		version,
		urls: () => [{ url: `https://worksconverter.com/download/WorksConverter-${version}.msi`, architecture: 'x64' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
