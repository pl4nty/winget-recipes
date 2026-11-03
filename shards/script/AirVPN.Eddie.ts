import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page holds the stable version; the changelog lists every
// version, so only the current version's entry is passed to the html source.
const page = 'https://airvpn.org/windows/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /id="eddie_download_box"[^>]*data-version="(?<version>\d+(?:\.\d+)+)"/);
	const changelog = await fetch('https://airvpn.org/mirrors/eddie.website/changelog/?software=client&format=html').then(
		(response) => response.text(),
	);
	const escaped = version.replaceAll('.', '\\.');
	const {
		groups: [entry],
	} = match(changelog, new RegExp(`<h2>Version ${escaped} [^<]*</h2>\\s*(<ul>[\\s\\S]*?</ul>)`));
	const base = `https://eddie.website/repository/eddie/${version}`;

	return {
		version,
		urls: () => [
			`${base}/eddie-ui_${version}_windows_x64_installer.exe`,
			`${base}/eddie-ui_${version}_windows_x86_installer.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
