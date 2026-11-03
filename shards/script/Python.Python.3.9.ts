import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// Only 3.9 releases with a Windows installer count (3.9.14+ are source-only).
// The release notes are that version's section of the docs changelog, passed
// to the html source as a data: URL so the rest of the (very long) page is left out.
export default defineShard(async () => {
	const downloads = await fetch('https://www.python.org/downloads/windows/').then((response) => response.text());
	const versions = [...downloads.matchAll(/ftp\/python\/(3\.9\.\d+)\/python-3\.9\.\d+-amd64\.exe/g)].map(([, v]) => v);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No Python 3.9 Windows installer found');

	const releaseNotesUrl = `https://docs.python.org/release/${version}/whatsnew/changelog.html`;
	const changelog = await fetch(releaseNotesUrl).then((response) => response.text());
	const id = `python-${version.replaceAll('.', '-')}-final`;
	const {
		groups: [section],
	} = match(changelog, new RegExp(`<section id="${id}">\\s*<h2>[\\s\\S]*?</h2>([\\s\\S]*?)(?=<section id="python-\\d)`));

	return {
		version,
		urls: () => [
			`https://www.python.org/ftp/python/${version}/python-${version}.exe`,
			`https://www.python.org/ftp/python/${version}/python-${version}-amd64.exe`,
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(section.replace(/<a class="headerlink"[^>]*>¶<\/a>/g, ''))}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
