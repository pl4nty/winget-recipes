import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags (Beta2, Beta-4, Hare) do not carry the version, so it is read
// from the installer asset name (HARE-Setup-1.0.0-beta.4.exe). Releases are
// marked as prereleases, so all releases are considered.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'Ravitz-Computers',
		repo: 'HARE',
		kind: 'all',
	});

	const installer = release.urls().find((url) => /\/HARE-Setup-[^/]+\.exe$/i.test(url));
	const {
		captures: { version },
	} = match(installer, /\/HARE-Setup-(?<version>\d[^/]*)\.exe$/i, 'No HARE setup asset found');

	return {
		version,
		urls: () => [installer!],
		releaseNotes: {
			source: 'github',
			owner: 'Ravitz-Computers',
			repo: 'HARE',
			tag: release.rawTag,
		},
	};
});
