import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link on the Robot Virtual Worlds home page carries the version
// as bare digits (RVWLevelPack_PalmIslandLuauEdition_272.exe = 2.7.2), one digit per component.
export default defineShard(async () => {
	const html = await fetch('https://www.robotvirtualworlds.com/').then((response) =>
		response.text(),
	);
	const {
		captures: { path, digits },
	} = match(html, /href="(?<path>files\/games\/RVWLevelPack_PalmIslandLuauEdition_(?<digits>\d{3,})\.exe)"/);

	return {
		version: digits.split('').join('.'),
		urls: () => [`https://www.robotvirtualworlds.com/${path}`],
	};
});
