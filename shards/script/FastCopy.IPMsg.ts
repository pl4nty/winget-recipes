import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { pageMatch } from 'anthelion/strategies';

// ipmsg.org links the latest installer, which lives on the main branch of FastCopyLab/IPMsgDist,
// so the download is pinned to the commit that last changed that file.
export default defineShard(async () => {
	const { version } = await pageMatch({
		url: 'https://ipmsg.org/',
		regex: /\/archive\/ipmsg(\d+(?:\.\d+)+)_installer\.exe/,
	});
	const file = `ipmsg${version}_installer.exe`;
	const commit = await getLatestFileCommit({ owner: 'FastCopyLab', repo: 'IPMsgDist', branch: 'main', path: file });

	return {
		version,
		urls: () => [`https://raw.githubusercontent.com/FastCopyLab/IPMsgDist/${commit}/${file}`],
	};
});
