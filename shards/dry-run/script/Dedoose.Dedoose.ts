import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const {
		groups: [version],
	} = match(await text('https://app.dedoose.com/_assets/xml/ClientVersions.xml'), /<windows>([^<]+)<\/windows>/);
	return { version, urls: () => ['https://downloads.dedoose.com/dedoose-app-releases/Dedoose-Installer.exe'] };
});
