import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags (sl-6.15-3) don't carry the package version; it is only in the asset names (sl-6.1.5-win64.exe).
// "woa64" (Windows on ARM64) isn't recognised by komac's filename arch detection, and the NSIS stub is x86.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'scaryrawr', repo: 'sl', tagRegex: '^sl-' });
	const pick = (suffix: string) => {
		const asset = release.assets.find((a) => new RegExp(`^sl-\\d+(?:\\.\\d+)+-${suffix}\\.exe$`).test(a.name));
		if (!asset) throw new Error(`No sl-<version>-${suffix}.exe asset on ${release.rawTag}`);
		return asset;
	};
	const x64 = pick('win64');
	const arm64 = pick('woa64');
	const version = /^sl-(\d+(?:\.\d+)+)-win64\.exe$/.exec(x64.name)![1]!;

	return {
		version,
		urls: () => [
			{ url: x64.browser_download_url, architecture: 'x64' },
			{ url: arm64.browser_download_url, architecture: 'arm64' },
		],
	};
});
