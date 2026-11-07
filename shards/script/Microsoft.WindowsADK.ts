import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The install page lists several current ADK lines (e.g. 10.1.26100.x and 10.1.28000.x); take the highest
export default defineShard(async () => {
	const page = await fetch('https://learn.microsoft.com/en-us/windows-hardware/get-started/adk-install').then((response) =>
		response.text(),
	);
	const releases = [
		...page.matchAll(
			/href="(?<url>https:\/\/go\.microsoft\.com\/fwlink\/\?linkid=\d+)"[^>]*>Download the (?:Windows )?ADK (?<version>\d+(?:\.\d+)+)/g,
		),
	].map(({ groups }) => ({ url: groups!.url!, version: groups!.version! }));
	if (releases.length === 0) throw new Error('No ADK download links found');
	const latest = releases.sort((a, b) => compareVersions(b.version, a.version))[0]!;

	return {
		version: latest.version,
		urls: () => [{ url: latest.url, architecture: 'x64' }],
		releaseNotes: {
			releaseNotesUrl: 'https://learn.microsoft.com/en-us/windows-hardware/get-started/what-s-new-in-kits-and-tools',
		},
	};
});
