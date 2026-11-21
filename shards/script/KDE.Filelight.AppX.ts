import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://cdn.kde.org/ci-builds/utilities/filelight/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per release series (release-YY.MM). The next series' branch exists before
// its release, so the series is taken from the newest stable KDE Gear release (YY.MM.P) instead.
// The AppX identity version is YY.(MM * 100 + P).<CI build>.0, e.g. 26.08.3 build 2243 -> 26.803.2243.0.
export default defineShard(async () => {
	const gear = [
		...(await getText('https://download.kde.org/stable/release-service/')).matchAll(
			/href="(\d+\.\d+\.\d+)\/"/gi,
		),
	]
		.map(([, version]) => version as string)
		.toSorted((a, b) => compareVersions(b, a))[0];
	if (!gear) throw new Error('no stable KDE Gear release found');
	const [year, month, patch] = gear.split('.');

	const dir = `${base}release-${year}.${month}/windows/`;
	const match = [
		...(await getText(dir)).matchAll(
			/href="(filelight-release_\d+\.\d+-(\d+)-windows-cl-msvc2022-x86_64-sideload\.appx)"/gi,
		),
	].at(-1);
	if (!match) throw new Error(`no Windows sideload package found in ${dir}`);
	const [, file, build] = match;

	return {
		version: [year, Number(month) * 100 + Number(patch), build, '0'].join('.'),
		urls: () => [`${dir}${file}`],
	};
});
