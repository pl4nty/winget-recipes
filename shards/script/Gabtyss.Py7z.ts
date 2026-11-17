import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor reuses one release tag (`Py7z`) and names the installer Py7Zip<major>.<minor>-Setup.exe,
// while winget-pkgs writes the version with three parts.
export default defineShard(async () => {
	const release = await getReleaseByTag({ owner: 'gabtyss', repo: 'py7zip', tag: 'Py7z' });
	const asset = release.assets.find((a) => /^Py7Zip\d+(?:\.\d+)*-Setup\.exe$/.test(a.name));
	if (!asset) throw new Error('No Py7Zip<version>-Setup.exe asset on the Py7z release');
	const parts = asset.name.replace(/^Py7Zip/, '').replace(/-Setup\.exe$/, '').split('.');
	while (parts.length < 3) parts.push('0');

	return {
		version: parts.join('.'),
		// The Inno Setup stub is 32-bit; upstream lists the installer as x64.
		urls: () => [{ url: asset.browser_download_url, architecture: 'x64' as const }],
		releaseNotes: { releaseNotesUrl: release.html_url },
	};
});
