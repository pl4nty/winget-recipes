import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// KDE's Craft CI publishes one sideload appx per release branch. Its package version is
// {year}.{month * 100 + patch}.{CI build}, e.g. 26.04.1 build 2866 is 26.401.2866, so the
// patch level comes from the matching KDE Gear release on download.kde.org.
const base = 'https://origin.cdn.kde.org/ci-builds/sdk/lokalize';

export default defineShard(async () => {
	const branchListing = await fetch(`${base}/`).then((response) => response.text());
	const branch = [...branchListing.matchAll(/href="release-(\d+\.\d+)\/"/g)]
		.map((m) => m[1]!)
		.sort(compareVersions)
		.at(-1);
	if (!branch) throw new Error('No Lokalize release branch found');

	const listing = await fetch(`${base}/release-${branch}/windows/`).then((response) => response.text());
	const file = listing.match(/href="(lokalize-release_[\d.]+-(\d+)-windows-cl-msvc2022-x86_64-sideload\.appx)"/);
	if (!file) throw new Error(`No Lokalize appx found on release-${branch}`);

	const releases = await fetch('https://download.kde.org/stable/release-service/').then((response) => response.text());
	const patch = [...releases.matchAll(/href="(\d+\.\d+\.\d+)\/"/g)]
		.map((m) => m[1]!)
		.filter((release) => release.startsWith(`${branch}.`))
		.sort(compareVersions)
		.at(-1)
		?.split('.')[2];
	const [year, month] = branch.split('.').map(Number);
	const url = `${base}/release-${branch}/windows/${file[1]}`;

	return {
		version: `${year}.${month! * 100 + Number(patch ?? 0)}.${file[2]}`,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url: `${url}?p`, architecture: 'x64' },
		],
	};
});
