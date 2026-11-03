import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Releases are tagged with a date (180218) while the package keeps the
// release title's "v<N>" (v6), including the leading v, so a JSON shard
// (which strips the v) can't express it. The one portable exe serves every
// architecture upstream lists.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'yugecin',
		repo: 'osukps',
	});

	const title = /\bv(\d+)\b/i.exec(release.title ?? '');
	if (!title) throw new Error(`No v<N> in release title of ${release.rawTag}: ${release.title}`);

	const [url] = release.urls().filter((url) => /\/osukps\.exe$/i.test(url));
	if (!url) throw new Error(`No osukps.exe in ${release.rawTag}: ${release.assetNames().join(', ')}`);

	return {
		version: `v${title[1]}`,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url, architecture: 'x86' },
			{ url, architecture: 'arm' },
			{ url, architecture: 'arm64' },
		],
		releaseNotes: { source: 'github', owner: 'yugecin', repo: 'osukps', tag: release.rawTag },
	};
});
