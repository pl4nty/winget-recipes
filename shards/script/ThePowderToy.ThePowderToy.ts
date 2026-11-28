import { defineShard } from 'anthelion';

// The game's own update feed lists the stable Major/Minor/Build as numbers; upstream
// versions use Major.Minor and the zip lives in the Build-<build> folder.
type Startup = { Updates: { Stable: { Major: number; Minor: number; Build: number } } };

export default defineShard(async () => {
	const startup: Startup = await fetch('https://powdertoy.co.uk/Startup.json').then((response) => response.json());
	const { Major, Minor, Build } = startup.Updates.Stable;
	if (![Major, Minor, Build].every(Number.isInteger)) throw new Error('No stable Powder Toy build found');

	return {
		version: `${Major}.${Minor}`,
		urls: () => [{ url: `https://powdertoy.co.uk/Download/Builds/Build-${Build}/powder.zip`, architecture: 'x64' }],
		releaseNotes: { releaseNotesUrl: `https://github.com/The-Powder-Toy/The-Powder-Toy/releases/tag/v${Major}.${Minor}.${Build}` },
	};
});
