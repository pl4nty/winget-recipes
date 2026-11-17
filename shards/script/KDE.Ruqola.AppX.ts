import { defineShard } from 'anthelion';

const base = 'https://cdn.kde.org/ci-builds/network/ruqola/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per stable branch (2.6/, 2.7/, ...), so both the newest branch
// and the build number in its sideload appx name have to be discovered.
// The appx identity carries the real version (2.600.<build>.0), so komac reads it from the package (DisplayVersion).
export default defineShard(async () => {
	const branch = [...(await getText(base)).matchAll(/href="(\d+)\.(\d+)\/"/g)]
		.map(([, major, minor]) => ({ major: Number(major), minor: Number(minor), name: `${major}.${minor}` }))
		.toSorted((a, b) => b.major - a.major || b.minor - a.minor)[0];
	if (!branch) throw new Error('no Ruqola release branch found');

	const dir = `${base}${branch.name}/windows/`;
	const build = [
		...(await getText(dir)).matchAll(/href="(ruqola-[\d.]+-(\d+)-windows-cl-msvc2022-x86_64-sideload\.appx)"/g),
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
