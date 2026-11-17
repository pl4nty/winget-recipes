import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// KDE Craft builds the appx version as major.(minor * 100 + patch).<CI pipeline number>.0.
const BASE = 'https://cdn.kde.org/ci-builds/graphics/glaxnimate/master/windows/';

export default defineShard(async () => {
	const listing = await fetch(BASE).then((response) => response.text());
	const {
		captures: { build },
	} = match(listing, /glaxnimate-master-(?<build>\d+)-windows-cl-msvc2022-x86_64-sideload\.appx/, 'No Glaxnimate appx build found');
	const cmake = await fetch('https://invent.kde.org/graphics/glaxnimate/-/raw/master/CMakeLists.txt').then((response) => response.text());
	const {
		captures: { major, minor, patch },
	} = match(cmake, /project\(Glaxnimate VERSION (?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/, 'No Glaxnimate project version found');

	return {
		version: `${major}.${Number(minor) * 100 + Number(patch)}.${build}.0`,
		urls: () => [`${BASE}glaxnimate-master-${build}-windows-cl-msvc2022-x86_64-sideload.appx`],
	};
});
