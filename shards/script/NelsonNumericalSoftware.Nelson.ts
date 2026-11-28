import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// PackageVersion carries the build number (1.16.0.5575), which only appears in
// the installer file names, not in the release tag.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'nelson-lang', repo: 'nelson' });
	const urls = release.urls();
	const x64 = urls.find((url) => /\/Nelson-\d+(?:\.\d+)+-x86-64\.exe$/.test(url));
	const arm64 = urls.find((url) => /\/Nelson-\d+(?:\.\d+)+-ARM64\.exe$/.test(url));
	if (!x64 || !arm64) throw new Error(`Missing Nelson installers in ${release.rawTag}`);
	const {
		captures: { version },
	} = match(x64, /\/Nelson-(?<version>\d+(?:\.\d+)+)-x86-64\.exe$/);

	return {
		version,
		urls: () => [x64, arm64],
		releaseNotes: { source: 'github', owner: 'nelson-lang', repo: 'nelson', tag: release.rawTag, cleanup: false },
	};
});
