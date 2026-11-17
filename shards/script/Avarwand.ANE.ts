import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor publishes the winget installer on one reused release tag (`wgane`), with the version only in the asset name.
export default defineShard(async () => {
	const release = await getReleaseByTag({ owner: 'avarwand', repo: 'ANE', tag: 'wgane' });
	const asset = release.assets.find((a) => /^ANE-\d+(?:\.\d+)+-Setup-x64\.msi$/.test(a.name));
	if (!asset) throw new Error('No ANE-<version>-Setup-x64.msi asset on the wgane release');
	const version = asset.name.replace(/^ANE-/, '').replace(/-Setup-x64\.msi$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { releaseNotesUrl: release.html_url },
	};
});
