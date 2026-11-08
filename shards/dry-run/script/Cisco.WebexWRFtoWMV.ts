import { defineShard } from 'anthelion';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://help.webex.com/en-us/article/WBX000026388/WRF2WMV-Converter', /atwrf2wmv[^"'\\]*\.zip/);
	return { version: { source: 'product' }, urls: () => [{ url, nestedInstallerMatches: ['atwrf2wmv.msi'] }] };
});
