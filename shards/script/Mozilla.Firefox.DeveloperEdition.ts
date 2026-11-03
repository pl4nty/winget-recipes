import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Developer Edition builds are betas (e.g. 160.0b4), but winget-pkgs versions them by
// release (160.0), so each release is submitted once. The release notes are the beta
// notes section of the vendor page, passed as a data: URL so the page chrome is left out.
// The en-US MSIs are left out: they wrap the exe, so komac reads a %Temp% install location,
// DisplayVersion 0.0.0.0 and one ProductCode for both architectures from them.
export default defineShard(async () => {
	const versions = await fetch('https://product-details.mozilla.org/1.0/firefox_versions.json').then((response) =>
		response.text(),
	);
	const {
		groups: [build],
		captures: { version },
	} = match(versions, /"FIREFOX_DEVEDITION":\s*"((?<version>\d+\.\d+)b\d+)"/);

	const base = `https://download-installer.cdn.mozilla.net/pub/devedition/releases/${build}`;
	const releaseNotesUrl = `https://www.firefox.com/en-US/firefox/${version}beta/releasenotes/`;
	const page = await fetch(releaseNotesUrl).then((response) => response.text());
	const {
		groups: [notes],
	} = match(page, /(<div class="[^"]*fl-c-release-notes-summary[\s\S]*?)<h2 class="fl-heading text-center/);

	return {
		version,
		urls: () => [
			`${base}/win32/en-US/Firefox%20Setup%20${build}.exe`,
			`${base}/win64/en-US/Firefox%20Setup%20${build}.exe`,
			`${base}/win64-aarch64/en-US/Firefox%20Setup%20${build}.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
