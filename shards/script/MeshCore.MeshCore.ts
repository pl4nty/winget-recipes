import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// winget-pkgs keeps the leading "v" in PackageVersion (v1.43.0), which JSON shards strip.
export default defineShard(async () => {
	const base = 'https://files.liamcottle.net/MeshCore';
	const listing = await fetch(`${base}/`).then((response) => response.text());
	const [latest] = [...listing.matchAll(/href="\.\/v(\d+(?:\.\d+)+)\/"/g)]
		.map((entry) => entry[1])
		.toSorted((a, b) => compareVersions(b, a));
	if (!latest) throw new Error('No MeshCore versions found');
	const version = `v${latest}`;

	return {
		version,
		urls: () => [`${base}/${version}/MeshCore-${version}-windows-x64.zip`],
	};
});
