import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Perforce publishes P4V/P4Merge under cdist2.perforce.com/perforce/rYY.R/, and newer release
// directories can exist before their Windows installer is uploaded. The package version is the
// installer's product version (for example 214.226.4565), so komac reads it and the release
// directory plus ETag is the update state.
export default defineShard(async () => {
	const listing = await fetch('https://cdist2.perforce.com/perforce/').then((response) => response.text());
	const releases = [...new Set([...listing.matchAll(/href="r(\d+\.\d+)\/"/gi)].map(([, release]) => release!))]
		.sort(compareVersions)
		.reverse();

	for (const release of releases) {
		const url = `https://cdist2.perforce.com/perforce/r${release}/bin.ntx64/p4vinst64.exe`;
		const response = await fetch(url, { method: 'HEAD' });
		if (!response.ok) continue;
		const etag = response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';

		return {
			version: { source: 'product' },
			urls: () => [{ url, architecture: 'x64' }],
			state: `r${release} ${etag}`,
			releaseNotes: {
				releaseNotesUrl: `https://cdist2.perforce.com/perforce/r${release}/doc/user/p4vnotes.txt`,
			},
		};
	}
	throw new Error('No p4vinst64.exe found under cdist2.perforce.com/perforce/');
});
