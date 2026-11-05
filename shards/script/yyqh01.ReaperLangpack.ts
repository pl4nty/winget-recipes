import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';
import { compareVersions, match } from 'anthelion/helpers';

// Every build is uploaded to the fixed `snapshot` release as
// ReaperLangpack_<yyyy.mm.dd>.<version>.exe; the package version is the part after the date.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'yyqh01',
		repo: 'reaper_and_osara_chineselanguagepack',
		tag: 'snapshot',
	});

	const builds = release.assets
		.filter((asset) => /^ReaperLangpack_\d{4}\.\d{2}\.\d{2}\.\d+(?:\.\d+)*\.exe$/.test(asset.name))
		.map((asset) => ({
			url: asset.browser_download_url,
			version: match(asset.name, /^ReaperLangpack_\d{4}\.\d{2}\.\d{2}\.(\d+(?:\.\d+)*)\.exe$/).groups[0],
		}))
		.sort((a, b) => compareVersions(b.version, a.version));
	const latest = builds[0];
	if (!latest) throw new Error('No ReaperLangpack installer found in the snapshot release');

	return {
		version: latest.version,
		urls: () => [{ url: latest.url, architecture: 'x64' }],
		releaseNotes: {
			releaseNotesUrl: 'https://github.com/yyqh01/reaper_and_osara_chineselanguagepack/releases/tag/snapshot',
		},
	};
});
