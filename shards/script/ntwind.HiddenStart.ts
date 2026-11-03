import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The version comes from the download link on the product page. The release
// notes are that version's entry on the "what's new" page, whose heading links
// to the blog post upstream uses as ReleaseNotesUrl. One installer serves x86
// and x64, as in the upstream manifest.
export default defineShard(async () => {
	const product = await fetch('https://www.ntwind.com/software/hstart.html').then((response) => response.text());
	const {
		captures: { version },
	} = match(product, /Hstart_(?<version>\d+(?:\.\d+)+)-setup\.exe/);

	const whatsNew = await fetch('https://www.ntwind.com/software/hstart/what-is-new.html').then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		captures: { link, notes },
	} = match(
		whatsNew,
		new RegExp(`<h2><a href="(?<link>blog/hidden-start-v${escaped}-[^"]+)">[^<]*</a></h2>(?<notes>[\\s\\S]*?)(?=<h2>)`),
	);
	const installer = `https://hstart.s3.amazonaws.com/Hstart_${version}-setup.exe`;

	return {
		version,
		urls: () => [
			{ url: installer, architecture: 'x86' },
			{ url: installer, architecture: 'x64' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `https://www.ntwind.com/${link}`,
			cleanup: false,
		},
	};
});
