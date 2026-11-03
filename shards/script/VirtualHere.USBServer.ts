import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The server binaries are unversioned, so the version comes from the "version x Changes"
// link on the Windows server page. The release notes are that version's section of the
// server version history page (node/958), passed as a data: URL so the page chrome is left out.
export default defineShard(async () => {
	const page = await fetch('https://www.virtualhere.com/windows_server_software').then((response) =>
		response.text(),
	);
	const {
		captures: { version },
	} = match(page, /version (?<version>\d+(?:\.\d+)+) Changes/);

	const history = await fetch('https://www.virtualhere.com/node/958').then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		captures: { notes },
	} = match(history, new RegExp(`<p>${escaped} \\([^)]*\\)<br>-+</p>(?<notes>[\\s\\S]*?)<p>\\d+(?:\\.\\d+)+ \\(`));

	return {
		version,
		urls: () => [
			'https://www.virtualhere.com/sites/default/files/usbserver/vhusbdwinw64.exe',
			'https://www.virtualhere.com/sites/default/files/usbserver/vhusbdwinarmw64.exe',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: `https://www.virtualhere.com/node/958#:~:text=${version}`,
			cleanup: false,
		},
	};
});
