import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// LyX's mirror holds one bin/<version>/ directory per release with its Windows installer,
// LyX-<253>-Installer-<n>-x64.exe. The package version is <release>.<n> (e.g. 2.4.4.1).
const mirror = 'https://ftp.lip6.fr/pub/lyx/bin/';

export default defineShard(async () => {
	const listing = await ky(mirror, { timeout: 60_000 }).text();
	const releases = [...new Set([...listing.matchAll(/href="(\d+(?:\.\d+)+)\/"/g)].map(([, v]) => v!))].sort(
		compareVersions,
	);

	// The newest directory can exist before its Windows installer is uploaded.
	for (const release of releases.reverse()) {
		const files = await ky(`${mirror}${release}/`, { timeout: 60_000 }).text();
		const installer = [...files.matchAll(/href="(LyX-\d+-Installer-(\d+)-x64\.exe)"/g)]
			.map(([, file, build]) => ({ file: file!, build: build! }))
			.sort((a, b) => Number(a.build) - Number(b.build))
			.at(-1);
		if (installer) {
			return {
				version: `${release}.${installer.build}`,
				urls: () => [`${mirror}${release}/${installer.file}`],
			};
		}
	}
	throw new Error('No LyX Windows installer found');
});
