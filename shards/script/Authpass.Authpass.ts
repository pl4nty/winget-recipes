import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// winget-pkgs includes the build number (1.9.11_2007), which only the Windows setup's name carries.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'authpass', repo: 'authpass' });
	const asset = release.assets.find((a) => /^AuthPass-setup-\d+(?:\.\d+)*_\d+\.exe$/.test(a.name));
	if (!asset) throw new Error(`No AuthPass-setup-<version>_<build>.exe asset on ${release.rawTag}`);
	const version = asset.name.replace(/^AuthPass-setup-/, '').replace(/\.exe$/, '');

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: { source: 'github', owner: 'authpass', repo: 'authpass', tag: release.rawTag, cleanup: false },
	};
});
