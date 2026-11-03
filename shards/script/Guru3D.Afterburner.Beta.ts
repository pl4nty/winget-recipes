import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Guru3D's beta download page links the NLUUG mirror zip, e.g.
// [Guru3D]-MSIAfterburnerSetup467Beta2Build16935.zip (4.6.7 Beta 2).
export default defineShard(async () => {
	const page = await fetch('https://www.guru3d.com/download/msi-afterburner-beta-download/').then((response) =>
		response.text(),
	);
	const { captures } = match(
		page.replace(/%5B/gi, '[').replace(/%5D/gi, ']'),
		/\[Guru3D\]-MSIAfterburnerSetup(?<digits>\d{3,})Beta(?<beta>\d+)Build(?<build>\d+)\.zip/,
		'No MSI Afterburner beta mirror zip found on the Guru3D download page',
	);
	const digits = captures.digits!;
	const version = `${digits[0]}.${digits[1]}.${digits.slice(2)} Beta ${captures.beta}`;
	const setup = `MSIAfterburnerSetup${digits}Beta${captures.beta}`;

	return {
		version,
		urls: () => [
			{
				url: `https://ftp.nluug.nl/pub/games/PC/guru3d/afterburner/[Guru3D]-${setup}Build${captures.build}.zip`,
				nestedInstallerMatches: [`${setup}.exe`],
			},
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.guru3d.com/download/msi-afterburner-beta-download/',
		},
	};
});
