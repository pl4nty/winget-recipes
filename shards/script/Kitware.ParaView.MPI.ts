import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The files listing names every released MSI under its vN.N directory. Take the newest stable
// MPI build and pass its file name to the download.php link the manifests use.
export default defineShard(async () => {
	const listing = await fetch('https://www.paraview.org/files/listing.txt').then((response) =>
		response.text(),
	);
	const builds = [
		...listing.matchAll(
			/^\.\/(v\d+\.\d+)\/(ParaView-(\d+\.\d+\.\d+)-MPI-Windows-Python[\d.]+-msvc\d+-AMD64\.msi)\s/gm,
		),
	].map(([, directory, file, version]) => ({ directory: directory!, file: file!, version: version! }));
	const latest = builds.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!latest) {
		throw new Error('No ParaView MPI Windows MSI found');
	}

	const { directory, file, version } = latest;
	return {
		version,
		urls: () => [
			`https://www.paraview.org/paraview-downloads/download.php?submit=Download&version=${directory}&type=binary&os=Windows&downloadFile=${file}`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://www.kitware.com/paraview-${version.replaceAll('.', '-')}-release-notes/`,
		},
	};
});
