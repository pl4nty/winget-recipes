import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged 2025.0.5, but the package version also carries the build
// from the Windows asset name (MDL-SDK-2025.0.5-387700.3418-nt-x86-64.zip).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'NVIDIA',
		repo: 'MDL-SDK',
	});

	const windows = release.assetNames().filter((name) => /^MDL-SDK-[^/]+-nt-[^/]+\.zip$/.test(name));
	const x64 = windows.find((name) => name.endsWith('-nt-x86-64.zip'));
	const {
		captures: { version },
	} = match(x64, /^MDL-SDK-(?<version>\d+(?:\.\d+)+-\d+(?:\.\d+)*)-nt-x86-64\.zip$/, 'No Windows x64 asset in the latest MDL-SDK release');

	const urls = () =>
		release.urls().filter((url) => windows.some((name) => url.endsWith(`/${name}`)) && url.includes(`/MDL-SDK-${version}-nt-`));

	return {
		version,
		urls,
	};
});
