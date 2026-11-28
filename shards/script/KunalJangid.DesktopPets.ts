import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream writes three-part versions (1.0.0), but newer tags have two parts (v1.2),
// so the tag is padded to three parts.
export default defineShard(async () => {
	const response = await fetch('https://github.com/kunal-jangid/Creature/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag, number },
	} = match(location, /\/releases\/tag\/(?<tag>v(?<number>\d+(?:\.\d+){1,2}))$/, 'No stable DesktopPets release found');
	const version = [...number.split('.'), '0', '0'].slice(0, 3).join('.');

	return {
		version,
		urls: () => [
			{ url: `https://github.com/kunal-jangid/Creature/releases/download/${tag}/DesktopPets-Setup-${tag}.exe`, architecture: 'x64' },
		],
		releaseNotes: { source: 'github', owner: 'kunal-jangid', repo: 'Creature', tag, cleanup: false },
	};
});
