import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The newest 3.12 installer comes from the Windows downloads page. Its section
// of the docs changelog becomes the release notes: it is passed to the html
// source as a data: URL so the other releases on the page are left out.
export default defineShard(async () => {
	const downloads = await fetch('https://www.python.org/downloads/windows/').then((response) => response.text());
	const versions = [...downloads.matchAll(/\/ftp\/python\/3\.12\.\d+\/python-(3\.12\.\d+)-amd64\.exe"/g)].map(([, version]) => version);
	const [version] = versions.sort((a, b) => compareVersions(b, a));

	const changelog = `https://docs.python.org/release/${version}/whatsnew/changelog.html`;
	const html = await fetch(changelog).then((response) => response.text());
	const {
		captures: { entry },
	} = match(
		html,
		new RegExp(`<section id="python-${version.replaceAll('.', '-')}-final">[\\s\\S]*?Release date:[^<]*</em></p>(?<entry>[\\s\\S]*?)(?=<section id="python-\\d|$)`),
	);
	const base = `https://www.python.org/ftp/python/${version}/python-${version}`;

	return {
		version,
		urls: () => [
			{ url: `${base}.exe`, architecture: 'x86' },
			{ url: `${base}.exe`, architecture: 'x86' },
			{ url: `${base}-amd64.exe`, architecture: 'x64' },
			{ url: `${base}-amd64.exe`, architecture: 'x64' },
			{ url: `${base}-arm64.exe`, architecture: 'arm64' },
			{ url: `${base}-arm64.exe`, architecture: 'arm64' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry.replaceAll(/<a class="headerlink"[^>]*>[^<]*<\/a>/g, ''))}`,
			releaseNotesUrl: `${changelog}#python-${version.replaceAll('.', '-')}`,
			cleanup: false,
		},
	};
});
