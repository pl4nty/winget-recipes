import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The release tag does not follow the package version: MSIs for newer builds are
// added to the same release and their file names carry the version, so take the highest.
const assetRegex = /\/ilfortunedinumeronezefiro-(\d+(?:\.\d+)+)-zafiro-amd64\.msi$/i;

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'GiulianoSpaghetti', repo: 'ZefiroFortune', useLatestEndpoint: true });
	const [latest] = release
		.urls()
		.flatMap((url) => {
			const version = assetRegex.exec(url)?.[1];
			return version ? [{ url, version }] : [];
		})
		.sort((a, b) => compareVersions(b.version, a.version));
	if (!latest) throw new Error('No ilfortunedinumeronezefiro MSI found in the latest release');

	return {
		version: latest.version,
		urls: () => [latest.url],
	};
});
