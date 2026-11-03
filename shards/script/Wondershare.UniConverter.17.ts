import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The "What's New" page lists Windows releases newest first. The first
// UniConverter 17 download link gives the short version used in the installer
// URL; its bullet list becomes the release notes (passed as a data: URL so the
// rest of the page is left out). The four-part PackageVersion (e.g. 17.6.0.33)
// only exists in the installer, so it is read from the ProductVersion.
const page = 'https://videoconverter.wondershare.com/what-is-new.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [, , notes],
		captures: { short, product },
	} = match(
		html,
		/cbs_down\/uniconverter_64bit_(?<short>17\.\d+\.\d+)_full(?<product>\d+)\.exe"[\s\S]*?(<ul class="font-size-large[^"]*">[\s\S]*?<\/ul>)/,
	);

	return {
		version: { source: 'product' },
		urls: () => [`https://download.wondershare.com/cbs_down/uniconverter_64bit_${short}_full${product}.exe`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
