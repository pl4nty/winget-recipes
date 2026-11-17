import { defineShard } from 'anthelion';

// The 2.10 directory keeps every rebuilt installer (setup.exe, setup-1.exe, ...), so pick the newest version and then its newest rebuild.
const DIRECTORY = 'https://download.gimp.org/gimp/v2.10/windows/';

export default defineShard(async () => {
	const page = await fetch(DIRECTORY).then((response) => response.text());
	const builds = Array.from(page.matchAll(/href="gimp-(2\.10\.\d+)-setup(?:-(\d+))?\.exe"/g), ([file, version, build]) => ({
		file: file.slice(6, -1),
		parts: [...version!.split('.').map(Number), Number(build ?? 0)],
		version: version!,
	}));
	builds.sort((a, b) => {
		for (let i = 0; i < a.parts.length; i++) if (a.parts[i] !== b.parts[i]) return b.parts[i]! - a.parts[i]!;
		return 0;
	});
	const latest = builds[0];
	if (!latest) throw new Error('No GIMP 2.10 Windows installer found');

	return {
		version: latest.version,
		urls: () => [`${DIRECTORY}${latest.file}`],
		releaseNotes: { releaseNotesUrl: 'https://www.gimp.org/release-notes/gimp-2.10.html' },
	};
});
