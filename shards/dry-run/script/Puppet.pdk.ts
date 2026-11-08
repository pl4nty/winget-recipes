import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://pm.puppet.com/cgi-bin/pdk_download.cgi?dist=win&arch=x64&ver=latest', { method: 'HEAD' });
	const {
		groups: [version],
	} = match(url, /pdk-(\d+\.\d+\.\d+)(?:\.\d+)?-x64\.msi/);
	return { version, urls: () => [url] };
});
