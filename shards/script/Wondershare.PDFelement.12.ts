import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The "What's New" page lists Windows releases newest first; the first
// "Version 12.x.y" heading is the newest PDFelement 12 release and its notes
// column becomes the release notes (passed as a data: URL so the rest of the
// page is left out). The product id in the installer name (full5239) comes from
// the page's unversioned Windows download link.
const page = 'https://pdf.wondershare.com/whats-new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { pid },
	} = match(html, /download\.wondershare\.com\/pdfelement-pro_full(?<pid>\d+)\.exe/);
	const {
		captures: { version, notes },
	} = match(
		html,
		/<h2 class="mb-3">Version (?<version>12\.\d+\.\d+)<\/h2>[\s\S]*?<div class="col-md-7 col-10 pt-4">(?<notes>[\s\S]*?<\/ul>)/,
	);

	return {
		version,
		urls: () => [
			{
				url: `https://download.wondershare.com/cbs_down/pdfelement-pro_64bit_${version}_full${pid}.exe`,
				architecture: 'x64',
			},
			{ url: `https://download.wondershare.com/cbs_down/pdfelement-pro_${version}_full${pid}.exe`, architecture: 'x86' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
