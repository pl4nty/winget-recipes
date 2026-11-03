import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link on the Robot Virtual Worlds home page carries the version
// as bare digits (RVWLevelPack_RVWChallengePack165.exe = 1.6.5), one digit per component.
export default defineShard(async () => {
	const html = await fetch('https://www.robotvirtualworlds.com/').then((response) =>
		response.text(),
	);
	const {
		captures: { path, digits },
	} = match(html, /href="(?<path>files\/curriculum\/RVWLevelPack_RVWChallengePack(?<digits>\d{3,})\.exe)"/);

	return {
		version: digits.split('').join('.'),
		urls: () => [`https://www.robotvirtualworlds.com/${path}`],
	};
});
