import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Xlight download URLs are unversioned, so read the version from the "what is
// new" page. Its newest entry becomes the release notes: it is passed to the
// html source as a data: URL so the older entries are left out.
const page = 'https://www.xlightftpd.com/whatsnew.htm';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [entry],
		captures: { version },
	} = match(html, /(<strong>(?<version>\d+(?:\.\d+)+)\s*\([^)]*\)<\/strong>\s*<ul>[\s\S]*?<\/ul>)/);

	return {
		version,
		urls: () => [
			{ url: 'https://www.xlightftpd.com/download/xlight.zip', architecture: 'x86' },
			'https://www.xlightftpd.com/download/xlight-x64.zip',
			{ url: 'https://www.xlightftpd.com/download/setup.exe', architecture: 'x86' },
			{ url: 'https://www.xlightftpd.com/download/setup32.msi', architecture: 'x86' },
			'https://www.xlightftpd.com/download/setup-x64.exe',
			'https://www.xlightftpd.com/download/setup64.msi',
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${page}#:~:text=${version}`,
			cleanup: false,
		},
		replace: true,
	};
});
