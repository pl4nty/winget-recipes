import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

const RELEASES = 'https://downloads.activestate.com/Komodo/releases/';

// The releases index links one folder per version; the MSI inside carries a build number that is not in the folder name.
export default defineShard(async () => {
	const index = await fetch(RELEASES).then((response) => response.text());
	const versions = [...index.matchAll(/releases\/(\d+(?:\.\d+)+)\/index\.html/g)].map(([, version]) => version!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error('No Komodo release found');
	const folder = await fetch(`${RELEASES}${version}/`).then((response) => response.text());
	const {
		captures: { file },
	} = match(folder, new RegExp(`/(?<file>Komodo-Edit-${version.replaceAll('.', '\\.')}-\\d+\\.msi)"`), `No Komodo Edit ${version} MSI found`);

	return {
		version,
		urls: () => [`${RELEASES}${version}/${file}`],
	};
});
