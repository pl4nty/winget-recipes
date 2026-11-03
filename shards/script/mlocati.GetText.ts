import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Tags look like v1.0-v1.19 or v1.0-v1.18-r3 (gettext, iconv, rebuild); winget
// versions join the parts with "+" (1.0+1.19, 1.0+1.18+r3).
const owner = 'mlocati';
const repo = 'gettext-iconv-windows';

export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner, repo });
	const parts = /^v(?<gettext>[\d.]+)-v(?<iconv>[\d.]+)(?:-(?<rebuild>r\d+))?$/.exec(rawTag)?.groups;
	if (!parts) throw new Error(`Unexpected tag ${rawTag}`);
	const { gettext, iconv, rebuild } = parts;
	const version = [gettext, iconv, rebuild].filter(Boolean).join('+');
	const base = `https://github.com/${owner}/${repo}/releases/download/${rawTag}/gettext${gettext}-iconv${iconv}`;

	return {
		version,
		urls: () => [`${base}-shared-32.exe`, `${base}-shared-64.exe`],
		releaseNotes: { source: 'github', owner, repo, tag: rawTag },
	};
});
