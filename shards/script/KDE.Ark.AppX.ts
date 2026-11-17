import { defineShard } from 'anthelion';

const base = 'https://cdn.kde.org/ci-builds/utilities/ark/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per release series (release-YY.MM/), so both the newest branch
// and the build number in its sideload appx name have to be discovered.
// The appx identity carries the real version (YY.MM00.<build>.0), so komac reads it from the package (DisplayVersion).
export default defineShard(async () => {
	const branch = [...(await getText(base)).matchAll(/href="release-(\d+)\.(\d+)\/"/g)]
		.map(([, major, minor]) => ({ major: Number(major), minor: Number(minor), name: `${major}.${minor}` }))
		.toSorted((a, b) => b.major - a.major || b.minor - a.minor)[0];
	if (!branch) throw new Error('no Ark release series found');

	const dir = `${base}release-${branch.name}/windows/`;
	const build = [
		...(await getText(dir)).matchAll(/href="(ark-release_[\d.]+-(\d+)-windows-cl-msvc2022-x86_64-sideload\.appx)"/g),
	]
		.map(([, file, number]) => ({ file: file!, number: Number(number) }))
		.toSorted((a, b) => b.number - a.number)[0];
	if (!build) throw new Error(`no sideload appx found in ${dir}`);

	return {
		version: { source: 'display' },
		state: `${branch.name}-${build.number}`,
		urls: () => [`${dir}${build.file}`],
	};
});
