import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const listing = await fetch('https://download.tixati.com/').then((response) => response.text());
	// Versions look like 3.44-1; compare them with the build suffix as a version part.
	const [version] = [...listing.matchAll(/tixati-(\d+\.\d+-\d+)\.portable\.zip"/g)]
		.map((match) => match[1]!)
		.sort((a, b) => compareVersions(b.replace('-', '.'), a.replace('-', '.')));
	if (!version) throw new Error('No Tixati portable zip found in the download listing');

	const url = `https://download.tixati.com/tixati-${version}.portable.zip`;

	return {
		version,
		urls: () => [
			{ url, architecture: 'x86', nestedInstallerMatches: ['tixati_Windows32bit.exe'] },
			{ url, architecture: 'x64', nestedInstallerMatches: ['tixati_Windows64bit.exe'] },
		],
	};
});
