import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The loader is only published under one unversioned URL. Its ProductVersion
// reads 4.0.<build>.<revision>, which the package writes as 4.<build>.<revision>.
const url = 'https://static.gc.my.games/MyGamesLoader.exe';

export default defineShard(async () => {
	const binary = Buffer.from(await fetch(url).then((response) => response.arrayBuffer()));
	const text = binary.toString('utf16le');
	const {
		captures: { major, build, revision },
	} = match(text, /ProductVersion\0+(?<major>\d+)\.0\.(?<build>\d+)\.(?<revision>\d+)\0/);

	return {
		version: `${major}.${build}.${revision}`,
		urls: () => [url],
	};
});
