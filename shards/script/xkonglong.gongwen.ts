import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags drop the dots (3800), so the version comes from the release title
// (小恐龙公文排版助手Ver 3.8.0.0); the MSI is inside the release zip, whose GBK entry
// names are not UTF-8 flagged, so it is matched by extension only.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'xkonglong', repo: 'gw', useLatestEndpoint: true });
	const {
		groups: [version],
	} = match(release.title ?? '', /Ver\s*(\d+(?:\.\d+)+)/i, `No version in ${release.rawTag} title`);
	const url = release.urls().find((url) => url.endsWith('.zip'));
	if (!url) throw new Error(`No zip in gongwen ${release.rawTag}`);

	return {
		version,
		urls: () => [{ url, nestedInstallerMatches: ['.msi'], architecture: 'neutral' as const }],
		releaseNotes: { source: 'github', owner: 'xkonglong', repo: 'gw', tag: release.rawTag },
	};
});
