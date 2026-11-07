import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

const owner = 'ShendoXT';
const repo = 'memcardrex';

// Release tags are short commit hashes (9909f69), so the version comes from the asset name:
// MemcardRex.2.0.RC1.zip -> 2.0-RC1, as upstream writes it.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner, repo, kind: 'all' });
	const asset = release.assets.find((a) => /^MemcardRex\.\d+(?:\.\d+)*(?:\.[A-Za-z]+\d*)?\.zip$/i.test(a.name));
	if (!asset) {
		throw new Error(`No MemcardRex zip in release ${release.rawTag}`);
	}
	const [, number, suffix] = /^MemcardRex\.(\d+(?:\.\d+)*)(?:\.([A-Za-z]+\d*))?\.zip$/i.exec(asset.name)!;
	const version = suffix ? `${number}-${suffix}` : number;

	return {
		version,
		urls: () => [{ url: asset.browser_download_url, nestedInstallerMatches: ['MemcardRex.exe'] }],
		releaseNotes: {
			source: 'github',
			owner,
			repo,
			tag: release.rawTag,
		},
	};
});
