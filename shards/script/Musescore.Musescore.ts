import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged v4.7.6, but the package version carries the build number
// from the MSI name (MuseScore-Studio-4.7.6.261022093-x86_64.msi).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'musescore',
		repo: 'MuseScore',
	});

	const msis = release.urls().filter((url) => /\/MuseScore-Studio-[\d.]+-(?:x86_64|aarch64|arm64)\.msi$/i.test(url));
	const version = match(msis[0], /MuseScore-Studio-(\d+(?:\.\d+){3})-/).groups[0];
	// x64 first (the upstream installer), then any ARM build the release ships.
	const urls = () => [...msis.filter((url) => /x86_64\.msi$/i.test(url)), ...msis.filter((url) => !/x86_64\.msi$/i.test(url))];

	return {
		version,
		urls,
		releaseNotes: {
			source: 'github',
			owner: 'musescore',
			repo: 'MuseScore',
			tag: release.rawTag,
		},
	};
});
