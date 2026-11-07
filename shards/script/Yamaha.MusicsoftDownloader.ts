import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor download URL is keyed by a numeric file id, and the zip name and
// nested setup carry the version without dots (msd_v576_win.zip, msd576.exe),
// so read both from the update page's download button.
const page = 'https://uk.yamaha.com/en/support/updates/msd-win-kbd.html';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { id, digits },
	} = match(
		html,
		/data-downloadid="(?<id>\d+)"[^>]*>\s*<span class="c-button__text">msd_v(?<digits>\d{3,})_win\.zip/i,
	);
	const version = digits!.split('').join('.');

	return {
		version,
		urls: () => [
			{
				url: `https://uk.yamaha.com/en/download/files/${id}/`,
				architecture: 'x86',
				nestedInstallerMatches: [`msd${digits}.exe`],
			},
		],
		replace: true,
	};
});
