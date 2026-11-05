import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const index = await fetch('https://nethack.org/common/index.html').then((response) => response.text());
	const {
		groups: [version],
	} = match(index, /download\/(\d+\.\d+\.\d+)\//);
	const short = version!.replaceAll('.', '');
	// The Windows download page links the latest rebuild of each zip (e.g. nethack-500-win-x64-4.zip).
	const page = await fetch(`https://nethack.org/v${short}/ports/download-win.html`).then((response) => response.text());
	const zip = (arch: string) =>
		`https://nethack.org${match(page, new RegExp(`(/download/${version!.replaceAll('.', '\\.')}/nethack-${short}-win-${arch}(?:-\\d+)?\\.zip)`)).groups[0]}`;

	return {
		version: version!,
		urls: () => [zip('x64'), zip('arm64')],
		releaseNotes: { releaseNotesUrl: `https://nethack.org/v${short}/release.html` },
	};
});
