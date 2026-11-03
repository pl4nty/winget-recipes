import { defineShard } from 'anthelion';
import { getLatestRelease, getReleaseByTag } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The vendor's own package scripts (Scripts/PackageManagers/Resolve-PackageRelease.ps1) build the
// Beta PackageVersion as <base>-beta.<published_at as yyyyMMddHHmmss UTC> from the newest GitHub prerelease.
export default defineShard(async () => {
	const owner = 'PLFJY';
	const repo = 'ContextMenuMgr';
	const { rawTag } = await getLatestRelease({ owner, repo, kind: 'prerelease' });
	const { published_at: publishedAt } = await getReleaseByTag({ owner, repo, tag: rawTag });
	if (!publishedAt) throw new Error(`Release ${rawTag} has no published_at`);

	const assetVersion = rawTag.replace(/^v/i, '');
	const base = match(assetVersion, /^(\d+\.\d+\.\d+(?:\.\d+)?)/).groups[0];
	const stamp = new Date(publishedAt).toISOString().replace(/\D/g, '').slice(0, 14);

	return {
		version: `${base}-beta.${stamp}`,
		urls: () =>
			['x64', 'x86', 'arm64'].map(
				(arch) =>
					`https://github.com/${owner}/${repo}/releases/download/${rawTag}/ContextMenuMgrPlus-${assetVersion}-${arch}-self-contained-Setup.exe`,
			),
		releaseNotes: { source: 'github', owner, repo, tag: rawTag },
	};
});
