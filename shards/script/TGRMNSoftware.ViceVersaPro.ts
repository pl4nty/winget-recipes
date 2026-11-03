import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page names the current build ("v7 build 7002") and links the
// installers by major version (vvpro7.exe, vvpro7-64.exe). Upstream versions
// are the major version followed by the remaining build digits (7002 -> 7.0.0.2).
export default defineShard(async () => {
	const html = await fetch('https://www.tgrmn.com/web/download.htm').then((response) => response.text());
	const {
		captures: { major, build },
	} = match(html, /ViceVersa PRO <span[^>]*>v(?<major>\d+)<\/span> <span[^>]*>build (?<build>\d+)<\/span>/);
	if (!build.startsWith(major)) throw new Error(`Build ${build} does not match major version ${major}`);

	return {
		version: [major, ...build.slice(major.length).split('')].join('.'),
		urls: () => [
			`https://www.tgrmn.com/web/downloads/vvpro${major}.exe`,
			`https://www.tgrmn.com/web/downloads/vvpro${major}-64.exe`,
		],
	};
});
