import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://simplemind.eu/download/trial-edition/').then((response) =>
		response.text(),
	);
	// Trial and full editions share the build: SimpleMindPro2101b6693TrialSetup.exe is 2.10.1 build 6693
	const { captures } = match(
		page,
		/SimpleMindPro(?<major>\d)(?<minor>\d+)(?<patch>\d)b(?<build>\d+)TrialSetup\.exe/,
	);
	const { major, minor, patch, build } = captures;
	const version = `${major}.${minor}.${patch}`;

	return {
		version,
		urls: () => [
			`https://modelmakertools.com/simplemind/SM2Win_x9D8KSPXxPSdP2xws2V/SimpleMindPro${major}${minor}${patch}b${build}Setup.exe`,
		],
	};
});
