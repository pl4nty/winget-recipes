import { defineShard } from 'anthelion';
import { sortVersions } from 'anthelion/strategies';

const base = 'https://cdn.kde.org/ci-builds/graphics/drawy';

export default defineShard(async () => {
	const { version: branch } = await sortVersions({ url: `${base}/`, regex: /href="(\d+(?:\.\d+)+)\/"/ });
	const { version: build } = await sortVersions({
		url: `${base}/${branch}/windows/`,
		regex: /href="drawy-[\d.]+-(\d+)-windows-cl-msvc2022-x86_64\.exe"/,
	});

	return {
		version: `${branch}.${build}`,
		urls: () => [`${base}/${branch}/windows/drawy-${branch}-${build}-windows-cl-msvc2022-x86_64.exe`],
	};
});
