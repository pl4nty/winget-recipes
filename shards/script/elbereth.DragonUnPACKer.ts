import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags encode the version as digits (release-56240-exedrachac is 5.6.2 build 40), so split the first three digits.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'elbereth', repo: 'DragonUnPACKer' });
	const [major, minor, patch] = match(release.rawTag, /^release-(\d)(\d)(\d)\d+/, `Unexpected tag ${release.rawTag}`).groups;
	const urls = release.urls().filter((url) => /-setup\.exe$/i.test(url));
	if (!urls.length) throw new Error(`No setup.exe in ${release.rawTag}`);

	return {
		version: `${major}.${minor}.${patch}`,
		urls: () => urls,
		releaseNotes: { releaseNotesUrl: `https://github.com/elbereth/DragonUnPACKer/releases/tag/${release.rawTag}` },
	};
});
