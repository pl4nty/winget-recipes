import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The S3 listing names lite installers kicad-<version>_<build>-x86_64-lite.exe; the build suffix is read from the listing.
export default defineShard(async () => {
	const listing = await fetch('https://kicad-downloads.s3.cern.ch/?prefix=windows/stable/').then((response) =>
		response.text(),
	);
	const files = [...listing.matchAll(/windows\/stable\/kicad-(\d+(?:\.\d+)+)_(\d+)-x86_64-lite\.exe/g)].map((m) => ({
		version: m[1]!,
		build: Number(m[2]),
	}));
	if (files.length === 0) throw new Error('No KiCad lite installer found in listing');
	const latest = files.sort((a, b) => compareVersions(a.version, b.version) || a.build - b.build).at(-1)!;

	return {
		version: latest.version,
		urls: () => [
			`https://kicad-downloads.s3.cern.ch/windows/stable/kicad-${latest.version}_${latest.build}-x86_64-lite.exe`,
		],
		releaseNotes: { releaseNotesUrl: 'https://www.kicad.org/blog/' },
	};
});
