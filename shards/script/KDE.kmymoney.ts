import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// download.kde.org lists one directory per stable release; the Windows installer file name carries a build suffix,
// so it is read from the latest release's win64 listing.
const BASE = 'https://download.kde.org/stable/kmymoney/';

export default defineShard(async () => {
	const index = await fetch(BASE).then((response) => response.text());
	const versions = [...index.matchAll(/href="(\d+(?:\.\d+)+)\/"/g)].map((m) => m[1]!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No kmymoney release found');
	const listing = await fetch(`${BASE}${version}/win64/`).then((response) => response.text());
	const file = match(
		listing,
		new RegExp(`href="(kmymoney5-mingw64-${version.replaceAll('.', '\\.')}-[^"]*-setup\\.exe)"`),
		`No Windows installer for kmymoney ${version}`,
	).groups[0];

	return {
		version,
		urls: () => [`${BASE}${version}/win64/${file}`],
	};
});
