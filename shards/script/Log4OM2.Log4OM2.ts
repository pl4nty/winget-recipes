import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// The download page links release zips named Log4OM2_<major>_<minor>_<patch>_<build>.zip,
// each holding an inno installer with the same base name.
const page = 'https://www.log4om.com/download/';

export default defineShard(async () => {
	const html = await ky(page, { timeout: 60_000 }).text();
	const version = [...html.matchAll(/Log4OM2_(\d+(?:_\d+){3})\.zip/g)]
		.map(([, raw]) => raw!.replaceAll('_', '.'))
		.sort(compareVersions)
		.at(-1);
	if (!version) {
		throw new Error('No Log4OM2 release zip found on the download page');
	}
	const raw = version.replaceAll('.', '_');

	return {
		version,
		urls: () => [
			{
				url: `https://www.log4om.com/l4ong/release/Log4OM2_${raw}.zip`,
				nestedInstallerMatches: [`Log4OM2_${raw}.exe`],
			},
		],
	};
});
