import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The download page sets each offered major's current build next to its major/minor
// code (170 for 17.0), which the installer file names carry; the newest build wins. The build history page's
// entry for that build becomes the release notes, passed as a data: URL so the rest
// of the page is left out.
const site = 'https://www.prestosoft.com';

export default defineShard(async () => {
	const download = await fetch(`${site}/edp_download.asp`).then((response) => response.text());
	const [[, code, version] = []] = [...download.matchAll(/\$\('#version(\d+)'\)\.text\('(\d+(?:\.\d+)+)'\)/g)].sort(
		([, , a], [, , b]) => compareVersions(b!, a!),
	);
	if (!version) throw new Error('No ExamDiff Pro version found');

	const history = await fetch(`${site}/edp_buildhistory.asp`).then((response) => response.text());
	const {
		groups: [entry],
	} = match(
		history,
		new RegExp(`(<h3[^>]*>Build ${version!.replaceAll('.', '\\.')}\\b[\\s\\S]*?</ul>)`),
	);
	const [major, minor] = version!.split('.');

	return {
		version: version!,
		urls: () => ['x64', 'Win32', 'arm64'].map((arch) => `${site}/download/edpro${code}_${arch}_setup.exe`),
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: `${site}/edp_buildhistory.asp#${major}.${minor}`,
			cleanup: false,
		},
	};
});
