import { defineShard } from 'anthelion';

const base = 'https://files.nordicsemi.com/artifactory/swtools/external/jlink/';

// Nordic mirrors SEGGER's J-Link installers as JLink_Windows_V<major><minor:2><letter?>_x86_64.exe.
// The installer's ProductVersion is <major>.<minor><letter> (9.24a); upstream writes releases
// without a letter as <major>.<minor>.0 (V818 -> 8.18.0).
export default defineShard(async () => {
	const response = await fetch(base);
	if (!response.ok) throw new Error(`${base} returned ${response.status}`);
	const latest = [...(await response.text()).matchAll(/href="JLink_Windows_V(\d)(\d{2})([a-z]?)_x86_64\.exe"/g)]
		.map(([, major, minor, letter]) => ({ major: Number(major), minor: Number(minor), letter: letter!, tag: `${major}${minor}${letter}` }))
		.toSorted((a, b) => b.major - a.major || b.minor - a.minor || b.letter.localeCompare(a.letter))[0];
	if (!latest) throw new Error('no J-Link Windows x64 installer found');

	return {
		version: latest.letter ? `${latest.major}.${latest.minor}${latest.letter}` : `${latest.major}.${latest.minor}.0`,
		urls: () => [`${base}JLink_Windows_V${latest.tag}_x86_64.exe`],
		releaseNotes: { releaseNotesUrl: 'https://www.segger.com/downloads/jlink/ReleaseNotes_JLink.html' },
	};
});
