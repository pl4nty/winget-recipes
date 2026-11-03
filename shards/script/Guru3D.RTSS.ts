import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Guru3D's download page links the NLUUG mirror zip, e.g. [Guru3D]-RTSSSetup737Build28314.zip (7.3.7).
export default defineShard(async () => {
	const response = await fetch('https://www.guru3d.com/download/rtss-rivatuner-statistics-server-download/');
	const page = await response.text();
	const links = [...new Set(page.match(/[^"'\s<>]*(?:\.zip|nluug|\/files\/)[^"'\s<>]*/gi) ?? [])].slice(0, 20);
	const { captures } = match(
		page.replace(/%5B/gi, '[').replace(/%5D/gi, ']'),
		/\[Guru3D\]-RTSSSetup(?<digits>\d{3,})Build(?<build>\d+)\.zip/,
		`No RTSS mirror zip found on the Guru3D download page (HTTP ${response.status}): ${links.join(' ')}`,
	);
	const digits = captures.digits!;
	const version = `${digits[0]}.${digits[1]}.${digits.slice(2)}`;

	return {
		version,
		urls: () => [
			{
				url: `https://ftp.nluug.nl/pub/games/PC/guru3d/afterburner/[Guru3D]-RTSSSetup${digits}Build${captures.build}.zip`,
				nestedInstallerMatches: [`RTSSSetup${digits}.exe`],
			},
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.guru3d.com/download/rtss-rivatuner-statistics-server-download/',
		},
	};
});
