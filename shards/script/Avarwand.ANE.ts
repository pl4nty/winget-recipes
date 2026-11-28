import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import { getReleaseByTag } from 'anthelion/github';

// The vendor publishes the winget installer on one reused release tag (`wgane`), with the version only in the asset name.
export default defineShard(async () => {
	const release = await getReleaseByTag({ owner: 'avarwand', repo: 'ANE', tag: 'wgane' });
	// The release keeps older installers too, so take the newest one.
	const [asset] = release.assets
		.filter((a) => /^ANE-\d+(?:\.\d+)+-Setup-x64\.msi$/.test(a.name))
		.sort((a, b) => compareVersions(b.name.slice(4, -14), a.name.slice(4, -14)));
	if (!asset) throw new Error('No ANE-<version>-Setup-x64.msi asset on the wgane release');
	const version = asset.name.slice(4, -14);

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { releaseNotesUrl: release.html_url },
	};
});
