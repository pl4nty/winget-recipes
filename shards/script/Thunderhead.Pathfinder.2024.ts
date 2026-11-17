import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// This package tracks the 2024 line only. The release notes link every MSI as
// Pathfinder-2024-<minor>-<MMDD>-x64-en.msi; WinGet versions them as 24.<minor>.<MMDD>.
export default defineShard(async () => {
	const response = await fetch('https://www.thunderheadeng.com/release-notes/pathfinder/');
	const page = await response.text();
	const builds = [...page.matchAll(/releases\/Pathfinder-2024-(\d+)-(\d{4})-x64-en\.msi/gi)].map((m) => `24.${m[1]}.${m[2]}`);
	if (builds.length === 0) throw new Error(`No Pathfinder 2024 MSI found in the release notes (HTTP ${response.status}, ${page.length} bytes)`);
	const version = builds.sort(compareVersions).at(-1)!;
	const [, minor, build] = version.split('.');

	return {
		version,
		urls: () => [`https://www.thunderheadeng.net/releases/Pathfinder-2024-${minor}-${build}-x64-en.msi`],
		releaseNotes: { releaseNotesUrl: 'https://www.thunderheadeng.com/release-notes/pathfinder/' },
	};
});
