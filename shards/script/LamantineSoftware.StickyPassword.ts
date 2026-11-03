import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const page = 'https://www.stickypassword.com/download';

export default defineShard(async () => {
	const html = await fetch(page, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((response) => response.text());
	// The installer name packs the version without dots: 8.9.11.2306 -> StickyPassword_rev89112306.exe.
	// Major and minor are one digit and the build is four digits, as in every release so far.
	const {
		groups: [file, major, minor, patch, build],
	} = match(html, /StickyPassword_rev(\d)(\d)(\d+?)(\d{4})\.exe/);

	return {
		version: `${major}.${minor}.${patch}.${build}`,
		urls: () => [`https://downloads.stickypassword.com/files/SP7/${file}`],
		releaseNotes: { releaseNotesUrl: page },
	};
});
