import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link is unversioned; the version is listed next to it on the support download page.
// The zip holds SMART_Tool_TG_v<version>_Setup.exe, so match the nested installer by prefix.
export default defineShard(async () => {
	const page = await fetch('https://support.teamgroupinc.com/en/support/download.php').then((response) => response.text());
	const version = match(
		page,
		/<td class="info">SSD S\.M\.A\.R\.T\. TOOL<\/td>\s*<td class="version">v(\d+(?:\.\d+)+)<\/td>[\s\S]*?act\.php\?act=1&(?:amp;)?index_id=35"/,
	).groups[0];

	return {
		version,
		urls: () => [
			{
				url: 'https://support.teamgroupinc.com/en/support/act.php?act=1&index_id=35',
				architecture: 'x64',
				nestedInstallerMatches: ['SMART_Tool_TG_'],
			},
		],
	};
});
