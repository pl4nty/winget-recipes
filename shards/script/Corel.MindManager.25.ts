import { inflateSync } from 'node:zlib';

import { defineShard } from 'anthelion';

const releaseNotesUrl = 'https://download.mindjet.com/MindManager_25_Windows_Release_Notes_EN.pdf';

// The Windows release notes PDF is the only vendor source that names the current 25.x build.
// Its page header reads "MindManager 25 Windows Release Notes: Version 25.x.y".
export default defineShard(async () => {
	const pdf = Buffer.from(await fetch(releaseNotesUrl).then((response) => response.arrayBuffer()));
	let version: string | undefined;
	for (const [, stream] of pdf.toString('latin1').matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
		let text: string;
		try {
			text = inflateSync(Buffer.from(stream!, 'latin1')).toString('latin1');
		} catch {
			continue;
		}
		// Join TJ text runs so kerning offsets do not split the version.
		const plain = [...text.matchAll(/\(((?:\\.|[^\\)])*)\)/g)].map(([, run]) => run).join('');
		version = /Version\s*(25\.\d+\.\d+)/.exec(plain)?.[1];
		if (version) break;
	}
	if (!version) throw new Error('MindManager 25 version not found in the release notes PDF');

	return {
		version: `${version}.0`,
		urls: () => [
			{
				url: `https://download.mindjet.com/MindManager_64bit_${version}_Admin.zip`,
				nestedInstallerMatches: ['MindManager 25.msi'],
			},
			`https://download.mindjet.com/MindManager_64bit_${version}_redist.exe`,
			{
				url: `https://download.mindjet.com/MindManager_32bit_${version}_Admin.zip`,
				nestedInstallerMatches: ['MindManager 25.msi'],
			},
			`https://download.mindjet.com/MindManager_32bit_${version}_redist.exe`,
		],
		releaseNotes: { releaseNotesUrl },
	};
});
