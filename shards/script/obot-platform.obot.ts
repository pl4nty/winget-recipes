import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// winget-pkgs keeps the leading v in PackageVersion, which JSON shards strip. Releases are
// published with make_latest: false, so sort the stable releases by version instead of
// following /releases/latest.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'obot-platform',
		repo: 'obot',
		kind: 'stable',
		sortByVersion: true,
		assetRegex: '_windows_(?:amd64|arm64)\\.zip$',
	});
	const base = `https://github.com/obot-platform/obot/releases/download/${release.rawTag}/obot_${release.rawTag}`;

	return {
		version: release.rawTag,
		urls: () => [`${base}_windows_amd64.zip`, `${base}_windows_arm64.zip`],
		releaseNotes: { source: 'github', owner: 'obot-platform', repo: 'obot', tag: release.rawTag },
	};
});
