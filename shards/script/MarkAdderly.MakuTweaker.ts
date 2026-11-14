import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged by release number (release58), so read the package
// version from the installer asset name (MakuTweaker.5.8.7.Setup.exe).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'MarkAdderly',
		repo: 'MakuTweaker',
		useLatestEndpoint: true,
	});

	const urls = () => release.urls().filter((url) => /\/MakuTweaker\.\d+(?:\.\d+)+\.Setup\.exe$/i.test(url));
	const version = match(urls()[0] ?? '', /\/MakuTweaker\.(\d+(?:\.\d+)+)\.Setup\.exe$/i).groups[0];

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'MarkAdderly',
			repo: 'MakuTweaker',
			tag: release.rawTag,
		},
	};
});
