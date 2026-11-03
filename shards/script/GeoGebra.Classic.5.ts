import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// version.txt holds the dashed build (5-4-934-0) that the installer file names use.
export default defineShard(async () => {
	const text = await ky('https://download.geogebra.org/installers/5.4/version.txt').text();
	const { captures } = match(text.trim(), /^(?<build>5-4-\d+-\d+)$/, 'Unexpected GeoGebra 5 version.txt');
	const build = captures.build!;
	const base = `https://download.geogebra.org/installers/5.4/GeoGebra-Windows-Installer-${build}`;

	return {
		version: build.replaceAll('-', '.'),
		urls: () => [`${base}.exe`, `${base}.msi`],
	};
});
