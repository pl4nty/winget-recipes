import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The software page links the Windows zip by a hashed Wix file id, so read the id and
// version from it. The release notes page holds every version, so only the section for
// this version is passed to the html source as a data: URL.
const software = 'https://www.cytrence.com/software';
const releaseNotesPage = 'https://www.cytrence.com/release-notes';

export default defineShard(async () => {
	const page = await fetch(software).then((response) => response.text());
	const {
		captures: { file, version },
	} = match(page, /_files\/archives\/(?<file>[0-9a-f]+_[0-9a-f]+)\.zip\?dn=CytrenceKiwi-(?<version>\d+(?:\.\d+)+)-win_x64\.zip/);

	const notes = await fetch(releaseNotesPage).then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		groups: [section],
	} = match(
		notes,
		new RegExp(`Kiwi App v${escaped}\\s*-[^<]*(?:</span>)*</p>([\\s\\S]*?)(?=<p[^>]*><span class="color_40|</div>)`),
	);

	return {
		version,
		urls: () => [`https://www.cytrence.com/_files/archives/${file}.zip?dn=CytrenceKiwi-${version}-win_x64.zip`],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(section)}`,
			releaseNotesUrl: releaseNotesPage,
			cleanup: false,
		},
	};
});
