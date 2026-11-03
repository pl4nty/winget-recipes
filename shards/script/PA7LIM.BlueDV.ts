import { defineShard } from 'anthelion';

// Builds are published as BlueDV-<build>-BETA.zip in a directory listing and packaged as 1.0.0.<build>.
// The newest CHANGES.txt entry becomes the release notes, passed as a data: URL so older entries are left out.
const base = 'https://software.pa7lim.nl/BlueDV/BETA/Windows/';

export default defineShard(async () => {
	const listing = await fetch(base).then((response) => response.text());
	const builds = [...listing.matchAll(/href="BlueDV-(\d+)-BETA\.zip"/g)].map((m) => Number(m[1]));
	if (!builds.length) throw new Error('No BlueDV build found');
	const build = Math.max(...builds);

	const changes = await fetch(`${base}CHANGES.txt`).then((response) => response.text());
	const entry = new RegExp(`^${build} \\([\\s\\S]*?(?=^\\d{4,} \\(|$(?![\\s\\S]))`, 'm').exec(changes)?.[0].trim();

	return {
		version: `1.0.0.${build}`,
		urls: () => [{ url: `${base}BlueDV-${build}-BETA.zip`, nestedInstallerMatches: ['.msi'] }],
		releaseNotes: entry
			? {
					source: 'plain-text',
					sourceUrl: `data:text/plain,${encodeURIComponent(entry)}`,
					releaseNotesUrl: `${base}CHANGES.txt`,
					cleanup: false,
				}
			: { releaseNotesUrl: `${base}CHANGES.txt` },
	};
});
