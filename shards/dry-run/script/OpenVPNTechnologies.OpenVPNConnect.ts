import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';
import { latestUpstreamVersion } from '../lib/winget.ts';

// The update feed only lists a newer release under the folder of the current one.
export default defineShard(async () => {
	const current = await latestUpstreamVersion('OpenVPNTechnologies.OpenVPNConnect');
	const xml = await text(`https://packages.openvpn.net/connect/v3/updates/${current}/MSI.txt`);
	if (!xml.includes('<SoftwareUpdate')) throw new Error(`No update after ${current}`);
	const value = (tag: string) => match(xml, new RegExp(`<${tag}>([^<]+)</${tag}>`)).groups[0];
	return { version: value('Version'), urls: () => [value('ContentURLx86'), value('ContentURL')] };
});
