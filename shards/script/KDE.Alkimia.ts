import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const dir = 'https://cdn.kde.org/ci-builds/office/alkimia/master/windows/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE ships Windows builds of Alkimia only from master CI, and keeps one build at a time.
// The build number in the filename is not the version, so the version comes from the
// project() call in master's CMakeLists.txt.
export default defineShard(async () => {
	const {
		captures: { file },
	} = match(
		await getText(dir),
		/href="(?<file>alkimia-master-\d+-windows-cl-msvc2022-x86_64\.exe)"/,
		'No Alkimia Windows installer found',
	);
	const {
		captures: { version },
	} = match(
		await getText('https://invent.kde.org/office/alkimia/-/raw/master/CMakeLists.txt'),
		/project\(alkimia VERSION (?<version>\d+(?:\.\d+)+)\)/,
		'No Alkimia version found in CMakeLists.txt',
	);

	return {
		version,
		urls: () => [`${dir}${file}`],
		releaseNotes: { releaseNotesUrl: 'https://invent.kde.org/office/alkimia/-/commits/master' },
	};
});
