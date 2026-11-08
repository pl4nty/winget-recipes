import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const {
		groups: [url, version],
	} = match(await text('https://www.realvnc.com/en/connect/download/vnc/'), /data-file="([^"]*VNC-Server-(\d+(?:\.\d+){2,})-Windows-msi\.zip)"/);
	return {
		version,
		urls: () => [{ url, nestedInstallerMatches: [`VNC-Server-${version}-Windows-en-64bit.msi`] }],
	};
});
