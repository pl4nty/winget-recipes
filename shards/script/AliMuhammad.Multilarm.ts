import { defineShard } from 'anthelion';

// Multilarm versions are build dates (1.YYYY.MDD, e.g. 1.2026.907 = 7 Sep 2026) and the MSI's
// DisplayVersion drops the century (1.26.907). The vendor publishes a dated copy next to the
// unversioned MSI, so derive the date from the unversioned MSI's Last-Modified header and
// confirm the matching versioned MSI exists (checking the day before/after for time zones).
const base = 'https://multilarm.com/multilarm/windows_installer';

export default defineShard(async () => {
	const head = await fetch(`${base}/MultilarmSetup.msi`, { method: 'HEAD' });
	const lastModified = head.headers.get('last-modified');
	if (!lastModified) throw new Error('No Last-Modified header for MultilarmSetup.msi');
	const modified = new Date(lastModified).getTime();

	for (const offset of [0, -1, 1]) {
		const date = new Date(modified + offset * 86_400_000);
		const version = `1.${date.getUTCFullYear()}.${date.getUTCMonth() + 1}${String(date.getUTCDate()).padStart(2, '0')}`;
		const url = `${base}/MultilarmSetup-${version}.msi`;
		const response = await fetch(url, { method: 'HEAD' });
		if (response.ok) {
			return {
				version,
				urls: () => [url],
				releaseNotes: { releaseNotesUrl: 'https://multilarm.com/downloads.html' },
			};
		}
	}
	throw new Error(`No dated MultilarmSetup-<version>.msi found for ${lastModified}`);
});
