import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await resolve('https://www.synkronizer.com/scripts/download11.php');
	const {
		groups: [version],
	} = match(url, /(\d+(?:\.\d+)+)\.zip$/);
	return { version, urls: () => [{ url, nestedInstallerMatches: [`Synkronizer.${version}.exe`] }] };
});
