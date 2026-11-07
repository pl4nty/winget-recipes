import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The vendor republishes a single rolling `Snapshot` release that keeps older
// installers too; the version only appears in the asset name
// (reaper_yyqh.<version>.exe), so take the highest one.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'yyqh01',
		repo: 'reaper_yyqh_plugins',
		tag: 'Snapshot',
	});

	const installers = release.assets
		.map((asset) => ({ asset, version: /^reaper_yyqh\.(\d+(?:\.\d+)*)\.exe$/i.exec(asset.name)?.[1] }))
		.filter((entry): entry is { asset: (typeof release.assets)[number]; version: string } => !!entry.version)
		.sort((a, b) => compareVersions(b.version, a.version));
	const latest = installers[0];
	if (!latest) throw new Error('No reaper_yyqh installer asset in the Snapshot release');

	return {
		version: latest.version,
		urls: () => [latest.asset.browser_download_url],
		releaseNotes: {
			releaseNotesUrl: release.html_url,
		},
	};
});
