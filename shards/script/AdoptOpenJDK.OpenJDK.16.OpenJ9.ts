import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The repository mixes HotSpot and OpenJ9 releases; OpenJ9 tags carry an
// "_openj9-<vm version>" suffix, which PackageVersion (16.0.1.9) drops.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'AdoptOpenJDK',
		repo: 'openjdk16-binaries',
		tagRegex: '_openj9-\\d+(?:\\.\\d+)+$',
		perPage: 100,
	});
	const {
		captures: { version, build },
	} = match(release.rawTag, /^jdk-(?<version>\d+(?:\.\d+)*)\+(?<build>\d+)_openj9-/, 'No OpenJ9 release found');
	const urls = release.urls().filter((url) => /OpenJDK16U-jdk_x64_windows_openj9_[^/]+\.msi$/.test(url));
	if (urls.length === 0) throw new Error(`No OpenJ9 x64 MSI in ${release.rawTag}`);

	return {
		version: `${version}.${build}`,
		urls: () => urls,
	};
});
