import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// KDE CI publishes the sideload AppX under one directory per release branch (release-YY.MM);
// the newest branch's newest build is used, and the package version comes from the AppX.
const base = 'https://origin.cdn.kde.org/ci-builds/multimedia/kasts';

export default defineShard(async () => {
	const branches = [...(await fetch(`${base}/`).then((r) => r.text())).matchAll(/href="release-(\d+\.\d+)\/"/g)]
		.map((m) => m[1] as string)
		.sort(compareVersions);
	const branch = branches.at(-1);
	if (!branch) throw new Error('No Kasts release branch found');
	const listing = await fetch(`${base}/release-${branch}/windows/`).then((r) => r.text());
	const regex = new RegExp(`kasts-release_${branch.replace('.', '\\.')}-(\\d+)-windows-cl-msvc2022-x86_64-sideload\\.appx"`, 'g');
	const build = [...listing.matchAll(regex)]
		.map((m) => m[1] as string)
		.sort(compareVersions)
		.at(-1);
	if (!build) throw new Error(`No Kasts sideload AppX in release-${branch}`);

	return {
		version: { source: 'display' },
		state: `${branch}-${build}`,
		urls: () => [
			`${base}/release-${branch}/windows/kasts-release_${branch}-${build}-windows-cl-msvc2022-x86_64-sideload.appx`,
		],
	};
});
