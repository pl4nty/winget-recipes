import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The release tag does not follow the package version: the MSI attached to the
// latest release is replaced in place and its file name carries the version. Older MSIs
// stay attached, so take the greatest version.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'GiulianoSpaghetti', repo: 'numfortune.material', useLatestEndpoint: true });
	const [latest] = release
		.urls()
		.flatMap((url) => {
			const found = /\/numfortune\.Avalonia-(\d+(?:\.\d+)+)-material-amd64\.msi$/i.exec(url);
			return found ? [{ url, version: found[1]! }] : [];
		})
		.sort((a, b) => compareVersions(b.version, a.version));
	if (!latest) throw new Error('No MSI asset found');
	const { url, version } = latest;

	return {
		version,
		urls: () => [url],
	};
});
