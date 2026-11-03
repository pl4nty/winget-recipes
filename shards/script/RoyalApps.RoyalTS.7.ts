import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const page = await fetch('https://www.royalapps.com/ts/win/download').then((response) => response.text());
	const match = /RoyalTSInstaller_(?<major>7)\.(?<minor>\d+)\.(?<build>\d+\.\d+)_x64\.msi/i.exec(page);
	if (!match?.groups) throw new Error('Royal TS 7 installer link not found');
	const { major, minor, build } = match.groups;
	const fileVersion = `${major}.${minor}.${build}`;

	return {
		version: `${major}.${Number(minor)}.${build}`,
		urls: () => [
			`https://download.royalapps.com/royalts/RoyalTSInstaller_${fileVersion}_x64.msi`,
			`https://download.royalapps.com/royalts/RoyalTSInstaller_${fileVersion}_ARM64.msi`,
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.royalapps.com/go/kb-ts-win-v7-releasenotes',
		},
	};
});
