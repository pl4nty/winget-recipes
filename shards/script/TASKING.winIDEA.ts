import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

const base = 'https://www.tasking.com/documentation/release-notes/winidea/';

export default defineShard(async () => {
	const index = await ky(base).text();
	const {
		groups: [page],
	} = match(index, /<a[^>]+href="(\d+[-_]\d+[-_]\d+[\w-]*\.html)"/);
	const notesUrl = new URL(page!, base).href;
	const notes = await ky(notesUrl).text();
	const {
		groups: [version, build],
	} = match(notes, /winIDEA build number:\s*(?:<[^>]+>\s*)*(\d+(?:\.\d+){3})\.(\d+)/);
	const file = `winIDEA_x64_${version!.replaceAll('.', '_')}_${build!}`;

	return {
		version: version!,
		urls: () => [
			`https://www.isystem.com/downloads/winIDEA/setup/${file}.exe`,
			`https://www.isystem.com/downloads/winIDEA/setup/${file}.zip`,
		],
		releaseNotes: {
			releaseNotesUrl: notesUrl,
		},
	};
});
