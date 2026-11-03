import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor republishes a single rolling `Snapshot` release; the version only
// appears in the installer asset name (reaper_yyqh.<version>.exe).
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'yyqh01',
		repo: 'reaper_yyqh_plugins',
		tag: 'Snapshot',
	});

	const asset = release.assets.find((asset) => /^reaper_yyqh\.\d+(?:\.\d+)*\.exe$/i.test(asset.name));
	if (!asset) throw new Error('No reaper_yyqh installer asset in the Snapshot release');
	const version = asset.name.replace(/^reaper_yyqh\./i, '').replace(/\.exe$/i, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: {
			releaseNotesUrl: release.html_url,
		},
	};
});
