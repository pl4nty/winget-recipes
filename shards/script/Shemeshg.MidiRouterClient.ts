import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Installers sit at the root of the SourceForge file tree, which the sourceforge strategy's feed regex can't match.
export default defineShard(async () => {
	const feed = await fetch('https://sourceforge.net/projects/midi-router-client/rss').then((response) => response.text());
	const version = [...feed.matchAll(/\/midi-router-client-(\d+(?:\.\d+)+)-win64\.exe/g)]
		.map((m) => m[1]!)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No MIDI Router Client Windows installer in the SourceForge feed');

	return {
		version,
		urls: () => [
			`https://sourceforge.net/projects/midi-router-client/files/midi-router-client-${version}-win64.exe/download`,
			{ url: `https://sourceforge.net/projects/midi-router-client/files/midi-router-client-${version}-win64-ARM.exe/download`, architecture: 'arm64' },
		],
	};
});
