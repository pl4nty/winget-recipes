import { defineShard } from 'anthelion';
import { text } from '../lib/fetch.ts';
import { latestUpstreamVersion } from '../lib/winget.ts';

// The update feed lists the next pseudo installer under the folder of the current version.
export default defineShard(async () => {
	const [major, , , build] = (await latestUpstreamVersion('DolphinComputerAccess.EasyReader')).split('.');
	const prefix = `http://www.dolphinuk.co.uk/updates/EasyReader/${major}${build}/`;
	const catalog = await text(`${prefix}file.cat`);
	const pseudo = catalog.match(/ED\d+\.exe/)?.[0];
	if (!pseudo) throw new Error(`No update listed in ${prefix}file.cat`);
	return { version: { source: 'product' }, urls: () => [new URL(pseudo, prefix).href] };
});
