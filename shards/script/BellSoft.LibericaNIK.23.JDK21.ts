import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// BellSoft's NIK API reports versions with a build suffix (23.1.13+1), while
// upstream PackageVersion drops it, so the suffix is stripped here.
type Release = { version: string; downloadUrl: string };

export default defineShard(async () => {
	const [release]: Release[] = await fetch(
		'https://api.bell-sw.com/v1/nik/releases?component-version=liberica@21&version-modifier=latest&os=windows&arch=x86&bitness=64&package-type=msi&bundle-type=standard',
	).then((response) => response.json());
	if (!release) throw new Error('No Liberica NIK release found');
	const {
		captures: { version },
	} = match(release.version, /^(?<version>\d+(?:\.\d+)+)\+\d+$/);
	const {
		captures: { tag },
	} = match(release.downloadUrl, /\/releases\/download\/(?<tag>[^/]+)\//);

	return {
		version,
		urls: () => [release.downloadUrl],
		releaseNotes: {
			releaseNotesUrl: `https://docs.bell-sw.com/liberica-nik/${tag.replaceAll('+', 'b')}/general/release-notes/`,
		},
	};
});
