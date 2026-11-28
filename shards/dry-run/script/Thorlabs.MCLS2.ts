import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const xml = await text('https://www.thorlabs.com/api/software_pages/check_updates?ItemID=MCLS2-CUSTOM');
	const value = (tag: string) => match(xml, new RegExp(`<${tag}>([^<]+)</${tag}>`)).groups[0];
	const url = value('DownloadLink').replace('//thin01mstroc282prod.dxcloud.episerver.net/', '//media.thorlabs.com/');
	return { version: value('VersionNumber'), urls: () => [{ url, nestedInstallerMatches: ['MCLS2_Software_Package/Components/MCLS2/MCLS2_Setup.exe'] }] };
});
