import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page lags behind the build, so read ProductVersion (1.2.1343.182) from the
// current download and keep its first three parts, which name the WinGet package folder.
export default defineShard(async () => {
	const bytes = await fetch('https://dl5.oo-software.com/files/oolanytix/OOLanytix.exe').then((response) =>
		response.arrayBuffer(),
	);
	// VERSIONINFO strings are UTF-16LE and may start at an odd offset, so decode both alignments.
	const decoder = new TextDecoder('utf-16le');
	const resources = decoder.decode(bytes) + decoder.decode(bytes.slice(1));
	const {
		groups: [version],
	} = match(resources, /ProductVersion\0+(\d+\.\d+\.\d+)(?:\.\d+)?\0/i);

	return {
		version,
		urls: () => [
			`https://package.oo-software.com/winget/lanytix/${version}/oolanytix_${version}_deu_x64.exe`,
			`https://package.oo-software.com/winget/lanytix/${version}/oolanytix_${version}_eng_x64.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.oo-software.com/en/oolanytix/changelog',
		},
	};
});
