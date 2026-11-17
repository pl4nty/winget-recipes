import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The home page links the current installer page, and that page links the
// installer file, whose path carries the full version with the build number.
export default defineShard(async () => {
	const home = await fetch('https://www.pj64-emu.com/').then((response) => response.text());
	const {
		groups: [installerPage],
	} = match(home, /href="(\/download\/project64-[\d-]+-installer)"/, 'No Project64 installer page found');
	const page = await fetch(`https://www.pj64-emu.com${installerPage}`).then((response) => response.text());
	const {
		captures: { path, version },
	} = match(
		page,
		/href="(?<path>\/file\/setup-project64-(?<version>\d+(?:-\d+)+)-[0-9a-f]+\/)"/,
		'No Project64 installer found',
	);

	return {
		version: version.replaceAll('-', '.'),
		urls: () => [`https://www.pj64-emu.com${path}`],
		releaseNotes: { releaseNotesUrl: 'https://github.com/project64/project64/blob/develop/Docs/CHANGELOG.md' },
	};
});
