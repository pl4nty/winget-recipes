import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The API lists the latest PSU and the latest CPU/CSPU of the feature line, so pick the
// highest version (the MSI ProductVersion is the upstream PackageVersion format).
type Release = { version: string };

export default defineShard(async () => {
	const releases: Release[] = await fetch(
		'https://api.bell-sw.com/v1/liberica/releases?version-feature=26&version-modifier=latest&os=windows&package-type=msi&bundle-type=jdk-full&fields=version',
	).then((response) => response.json());
	const [release] = releases
		.map(({ version }) => version)
		.toSorted((a, b) => {
			// Compare the version (8u513, 26.0.2.1) before the build number after the +
			const [aVersion = '', aBuild = '0'] = a.replace('u', '.').split('+');
			const [bVersion = '', bBuild = '0'] = b.replace('u', '.').split('+');
			return compareVersions(bVersion, aVersion) || compareVersions(bBuild, aBuild);
		});
	if (!release) throw new Error('No Liberica release found');

	return {
		version: { source: 'display' },
		urls: () => [
			`https://download.bell-sw.com/java/${release}/bellsoft-jdk${release}-windows-amd64-full.msi`,
			`https://download.bell-sw.com/java/${release}/bellsoft-jdk${release}-windows-aarch64-full.msi`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://docs.bell-sw.com/liberica-jdk/${release.replaceAll('+', 'b')}/general/release-notes/`,
		},
	};
});
