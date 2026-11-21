import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged by date (2022-01-04); the GTK version is in the asset name
// (gtk3-runtime-3.24.31-2022-01-04-ts-win64.exe).
export default defineShard(async () => {
	const owner = 'tschoonj';
	const repo = 'GTK-for-Windows-Runtime-Environment-Installer';
	const release = await getLatestRelease({ owner, repo, assetRegex: '^gtk3-runtime-.*-win64\\.exe$' });

	const urls = () => release.urls().filter((url) => /\/gtk3-runtime-[^/]+-win64\.exe$/.test(url));
	const version = match(urls()[0], /\/gtk3-runtime-(\d+(?:\.\d+)+)-/).groups[0];

	return {
		version,
		urls,
		releaseNotes: { source: 'github', owner, repo, tag: release.rawTag },
	};
});
