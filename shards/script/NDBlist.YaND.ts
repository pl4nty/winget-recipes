import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The setup file name carries the version with underscores (YaNDsetup7_0.exe = 7.0).
export default defineShard(async () => {
	const html = await fetch('https://www.ndblist.info/datamodes.htm').then((response) =>
		response.text(),
	);
	const {
		captures: { file, raw },
	} = match(html, /href="index_htm_files\/(?<file>YaNDsetup(?<raw>\d+(?:_\d+)+)\.exe)"/);

	return {
		version: raw.replaceAll('_', '.'),
		urls: () => [`https://www.ndblist.info/index_htm_files/${file}`],
	};
});
