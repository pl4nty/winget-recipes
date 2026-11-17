import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

type MongrelFile = { version: string; channel: string; platform: string; arch: string; file_name: string; artifact_url_path: string };

// The download API lists every published build; installer URLs are opaque ids, so pick the newest
// stable Windows build and order its installers like the winget-pkgs manifest.
const FILES = ['x64_en-US.msi', 'x64-setup.exe', 'arm64_en-US.msi', 'arm64-setup.exe'];

export default defineShard(async () => {
	const { files } = (await fetch('https://www.visorcraft.com/api/downloads/mongrel').then((response) => response.json())) as {
		files: MongrelFile[];
	};
	const windows = files.filter((file) => file.channel === 'stable' && file.platform === 'windows');
	const version = windows.map((file) => file.version).sort(compareVersions).at(-1);
	if (!version) throw new Error('No stable Mongrel Windows build found');

	const urls = FILES.map((suffix) => {
		const file = windows.find((candidate) => candidate.version === version && candidate.file_name === `Mongrel_${version}_${suffix}`);
		if (!file) throw new Error(`Mongrel ${version} has no ${suffix} installer`);
		return `https://www.visorcraft.com${file.artifact_url_path}`;
	});

	return {
		version,
		urls: () => urls,
		releaseNotes: { releaseNotesUrl: 'https://www.visorcraft.com/download' },
	};
});
