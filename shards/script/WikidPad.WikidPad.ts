import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// WikidPad releases (mostly GitHub prereleases) are tagged WikidPad-<major>-<minor>-<pre> (WikidPad-2-3-rc02),
// and upstream writes the version as <major>.<minor><pre> (2.3rc02), the installer name the vendor uses.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'WikidPad', repo: 'WikidPad', kind: 'all', tagRegex: '^WikidPad-' });
	const parts = /^WikidPad-(\d+(?:-\d+)*?)(?:-([a-z]+\d*))?$/.exec(release.rawTag);
	if (!parts) throw new Error(`Unexpected WikidPad tag ${release.rawTag}`);
	const version = `${parts[1]!.replaceAll('-', '.')}${parts[2] ?? ''}`;

	return {
		version,
		urls: () => [`https://github.com/WikidPad/WikidPad/releases/download/${release.rawTag}/WikidPad-${version}.exe`],
	};
});
