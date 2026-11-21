import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// paraview.org/files/ has one directory per minor (v6.2/). The newest one holds the non-MPI Windows
// MSI, whose Python and MSVC parts (Python3.12-msvc2017) are read from the listing. The manifests
// carry the download.php link the website serves rather than the direct /files/ path.
const files = 'https://www.paraview.org/files/';

export default defineShard(async () => {
	const index = await ky(files, { timeout: 60_000 }).text();
	const minor = [...index.matchAll(/href="v(\d+\.\d+)\/"/g)]
		.map(([, minor]) => minor!)
		.sort(compareVersions)
		.at(-1);
	if (!minor) {
		throw new Error('No ParaView release directory found');
	}

	const listing = await ky(`${files}v${minor}/`, { timeout: 60_000 }).text();
	const latest = [
		...listing.matchAll(
			/href="(ParaView-(\d+(?:\.\d+)+)-Windows-Python[\d.]+-msvc\d+-AMD64\.msi)"/g,
		),
	]
		.map(([, file, version]) => ({ file: file!, version: version! }))
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) {
		throw new Error(`No ParaView Windows MSI in v${minor}/`);
	}
	const { file, version } = latest;

	return {
		version,
		urls: () => [
			`https://www.paraview.org/paraview-downloads/download.php?submit=Download&version=v${minor}&type=binary&os=Windows&downloadFile=${file}`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://www.kitware.com/paraview-${version.replaceAll('.', '-')}-release-notes/`,
		},
	};
});
