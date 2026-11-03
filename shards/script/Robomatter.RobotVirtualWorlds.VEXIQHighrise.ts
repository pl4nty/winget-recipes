import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The Robot Virtual Worlds home page links the level pack installer, whose file
// name carries the version without dots (RVWLevelPack_VEX_Highrise302n.exe = 3.0.2).
const page = 'https://www.robotvirtualworlds.com/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [path],
		captures: { major, minor, patch },
	} = match(html, /href="(files\/games\/RVWLevelPack_VEX_Highrise(?<major>\d)(?<minor>\d)(?<patch>\d+)[a-z]?\.exe)"/i);

	return {
		version: `${major}.${minor}.${patch}`,
		urls: () => [new URL(path, page).href],
		replace: true,
	};
});
