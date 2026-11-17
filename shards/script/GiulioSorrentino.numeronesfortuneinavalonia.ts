import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The release tag does not follow the package version: the MSI attached to the
// latest release is replaced in place and its file name carries the version.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'GiulianoSpaghetti', repo: 'numfortune.material', useLatestEndpoint: true });
	const url = release.urls().find((url) => /\/numfortune\.Avalonia-(\d+(?:\.\d+)+)-material-amd64\.msi$/i.test(url));
	const {
		groups: [version],
	} = match(url, /\/numfortune\.Avalonia-(\d+(?:\.\d+)+)-material-amd64\.msi$/i);

	return {
		version,
		urls: () => [url],
	};
});
