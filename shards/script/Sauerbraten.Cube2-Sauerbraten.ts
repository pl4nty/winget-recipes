import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// Windows builds are filed under the release folder (e.g. 2020_11_29/sauerbraten_2020_12_21_windows.exe),
// so read the folder and the build date together from the SourceForge feed.
export default defineShard(async () => {
	const feed = await ky('https://sourceforge.net/projects/sauerbraten/rss?path=/sauerbraten', {
		timeout: 60_000,
		retry: 3,
	}).text();
	const builds = [...feed.matchAll(/\/files\/sauerbraten\/(\d{4}_\d{2}_\d{2})\/sauerbraten_(\d{4}_\d{2}_\d{2})_windows\.exe/gi)].map(
		([, folder, version]) => ({ folder: folder!, version: version! }),
	);
	const latest = builds.sort((a, b) => compareVersions(a.version.replaceAll('_', '.'), b.version.replaceAll('_', '.'))).at(-1);
	if (!latest) throw new Error('No Sauerbraten Windows installer found');

	return {
		version: latest.version,
		urls: () => [
			`https://sourceforge.net/projects/sauerbraten/files/sauerbraten/${latest.folder}/sauerbraten_${latest.version}_windows.exe/download`,
		],
	};
});
