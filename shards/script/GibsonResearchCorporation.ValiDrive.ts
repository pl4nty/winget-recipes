import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The download URL is unversioned, so read the version from the release history
// page. Entries are listed oldest first; the newest entry becomes the release notes.
const page = 'https://www.grc.com/validrive/version-history.htm';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const entries = [...html.matchAll(/<li><span class="pointy">v(?<version>\d+(?:\.\d+)+)<\/span>[\s\S]*?<\/li>/g)];
	if (entries.length === 0) throw new Error('No ValiDrive versions found');
	const [latest] = entries.sort((a, b) => compareVersions(b.groups!.version, a.groups!.version));

	return {
		version: latest.groups!.version,
		urls: () => [{ url: 'https://www.grc.com/files/validrive.exe', architecture: 'x86' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<ul>${latest[0]}</ul>`)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
		replace: true,
	};
});
