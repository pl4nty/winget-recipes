import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://cdn.kde.org/ci-builds/utilities/filelight/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per release series (release-YY.MM). The next series' branch exists before
// its release, so the series is taken from the newest stable KDE Gear release instead.
// The package version is the AppX identity version, which komac reads.
export default defineShard(async () => {
	const gear = [
		...(await getText('https://download.kde.org/stable/release-service/')).matchAll(
			/href="(\d+\.\d+)\.\d+\/"/gi,
		),
	]
		.map(([, series]) => series as string)
		.toSorted((a, b) => compareVersions(b, a))[0];
	if (!gear) throw new Error('no stable KDE Gear release found');

	const dir = `${base}release-${gear}/windows/`;
	const file = [
		...(await getText(dir)).matchAll(
			/href="(filelight-release_\d+\.\d+-\d+-windows-cl-msvc2022-x86_64-sideload\.appx)"/gi,
		),
	].at(-1)?.[1];
	if (!file) throw new Error(`no Windows sideload package found in ${dir}`);

	return {
		version: { source: 'product' },
		urls: () => [`${dir}${file}`],
		state: file,
	};
});
