import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page links the newest Windows build by file id, so read the
// version and id from it. The release-note page lists every version; only the
// matching entry is passed to the html source as a data: URL.
const base = 'https://developer.samsung.com';
const releaseNotesUrl = `${base}/watch-face-studio/release-note.html`;

export default defineShard(async () => {
	const download = await fetch(`${base}/watch-face-studio/download.html`).then((response) => response.text());
	const {
		captures: { version, id },
	} = match(
		download,
		/Watch Face Studio for Win (?<version>\d+(?:\.\d+)+)[^<]*<\/span>[\s\S]*?href="\/WatchFaceStudio\/file\/(?<id>[0-9a-f-]+)"/,
	);

	const notes = await fetch(releaseNotesUrl).then((response) => response.text());
	const entry = new RegExp(
		`>Watch Face Studio ${version.replaceAll('.', '\\.')}<[\\s\\S]*?<div class="card-body">([\\s\\S]*?)</div>`,
	).exec(notes)?.[1];

	return {
		version,
		urls: () => [`${base}/WatchFaceStudio/file/${id}`],
		releaseNotes: entry
			? {
					source: 'html',
					sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
					releaseNotesUrl,
					cleanup: false,
				}
			: { releaseNotesUrl },
	};
});
