import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags are v<upstream version>.<revision> (v3.6.3.1); upstream writes the
// revision as a suffix (3.6.3-r1), so the version is rebuilt from the tag.
export default defineShard(async () => {
	const owner = 'desktop-plus';
	const repo = 'desktop-plus';
	const { rawTag } = await getLatestReleaseFromRedirect({ owner, repo });
	const {
		groups: [base, revision],
	} = match(rawTag, /^v(\d+\.\d+\.\d+)\.(\d+)$/);
	const tag = `v${base}.${revision}`;

	return {
		version: `${base}-r${revision}`,
		urls: () => [
			`https://github.com/${owner}/${repo}/releases/download/${tag}/DesktopPlus-${tag}-windows-x64.exe`,
			`https://github.com/${owner}/${repo}/releases/download/${tag}/DesktopPlus-${tag}-windows-arm64.exe`,
		],
		releaseNotes: { source: 'github', owner, repo, tag },
	};
});
