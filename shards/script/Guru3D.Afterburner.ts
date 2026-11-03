import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// Guru3D hosts the stable MSI Afterburner build on its nluug mirror as
// [Guru3D]-MSIAfterburnerSetup<466>Build<16757>.zip; the build number is only known from the
// download page, and the three digits after "Setup" are the dotted version.
const page = 'https://www.guru3d.com/download/msi-afterburner-download/';

export default defineShard(async () => {
	const html = await ky(page, { timeout: 60_000 }).text();
	const { captures } = match(
		html,
		/https:\/\/ftp\.nluug\.nl\/pub\/games\/PC\/guru3d\/afterburner\/\[Guru3D\]-MSIAfterburnerSetup(?<compact>\d{3})Build(?<build>\d+)\.zip/,
		'No stable MSI Afterburner download found on the Guru3D page',
	);
	const compact = captures.compact!;
	const version = compact.split('').join('.');

	return {
		version,
		urls: () => [
			{
				url: `https://ftp.nluug.nl/pub/games/PC/guru3d/afterburner/[Guru3D]-MSIAfterburnerSetup${compact}Build${captures.build}.zip`,
				nestedInstallerMatches: [`MSIAfterburnerSetup${compact}.exe`],
			},
		],
	};
});
