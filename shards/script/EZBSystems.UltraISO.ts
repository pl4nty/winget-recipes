import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The download page announces the full build (e.g. 9.7.6.3860); the package uses the marketing
// version (9.76), so join the minor and patch digits and drop the build number.
export default defineShard(async () => {
	const page = await ky('https://www.ultraiso.com/download.html').text();
	const {
		groups: [major, minor, patch],
	} = match(page, /UltraISO (\d+)\.(\d+)\.(\d+)\.\d+ released/);

	return {
		version: `${major}.${minor}${patch}`,
		urls: () => ['https://www.ultraiso.com/uiso9_pe.exe'],
		replace: true,
	};
});
