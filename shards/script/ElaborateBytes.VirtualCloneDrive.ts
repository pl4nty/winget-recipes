import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The revision history lists every release, newest first. Its top entry gives
// the version (installer URLs drop the dots: 5.5.3.0 -> 5530) and becomes the
// release notes, passed as a data: URL so older entries are left out.
const changelog = 'https://www.elby.ch/download/changes_vcd.txt';

export default defineShard(async () => {
	const text = await fetch(changelog).then((response) => response.text());
	const {
		groups: [, entry],
		captures: { version },
	} = match(
		text,
		/Virtual CloneDrive (?<version>\d+(?:\.\d+)+): [^\n]*\n([\s\S]*?)(?=\n\s*\nVirtual CloneDrive \d|$)/,
	);

	return {
		version,
		urls: () => [
			{
				url: `https://www.elby.ch/download/SetupVirtualCloneDrive${version.replaceAll('.', '')}.exe`,
				architecture: 'neutral',
			},
		],
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: `data:text/plain,${encodeURIComponent(entry.trim())}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
	};
});
