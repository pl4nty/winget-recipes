import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream versions carry a leading "V" (e.g. V1.2.5), which JSON shards strip.
export default defineShard(async () => {
	const page = await fetch('https://www.dji.com/downloads/softwares/assistant-dji-2').then((response) => response.text());
	const {
		captures: { date, version },
	} = match(
		page,
		/dl\.djicdn\.com\/downloads\/dji_assistant\/(?<date>\d+)\/DJI\+Assistant\+2\+(?<version>\d+(?:\.\d+)+)\.exe/,
		'No DJI Assistant 2 installer found',
	);

	return {
		version: `V${version}`,
		urls: () => [`https://dl.djicdn.com/downloads/dji_assistant/${date}/DJI+Assistant+2+${version}.exe`],
	};
});
