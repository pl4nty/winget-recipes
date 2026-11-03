import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://reshade.me/').then((response) => response.text());
	const {
		groups: [version],
	} = match(page, /href="\/downloads\/ReShade_Setup_([\d.]+)\.exe"/);
	const [major, minor] = version!.split('.');
	const releases = await fetch('https://reshade.me/releases').then((response) => response.text());
	const {
		groups: [release],
	} = match(releases, new RegExp(`href="(/releases/\\d+-${major}-${minor})"`));

	return {
		version: version!,
		urls: () => [`https://reshade.me/downloads/ReShade_Setup_${version}.exe`],
		releaseNotes: {
			releaseNotesUrl: `https://reshade.me${release}`,
		},
	};
});
