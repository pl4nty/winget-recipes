import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the "v." prefix in PackageVersion (v.2.6.0), which JSON shards
// strip, so the latest Windows build is read from the SourceForge RSS feed here.
export default defineShard(async () => {
	const rss = await (await fetch('https://sourceforge.net/projects/qtpfsgui/rss')).text();
	const {
		captures: { version },
	} = match(
		rss,
		/\/files\/luminance\/(?<version>\d+(?:\.\d+)+)\/Luminance-HDR_v\.\k<version>_Windows_64\.exe\/download/,
		'No Luminance HDR Windows installer found',
	);

	return {
		version: `v.${version}`,
		urls: () => [
			`https://sourceforge.net/projects/qtpfsgui/files/luminance/${version}/Luminance-HDR_v.${version}_Windows_64.exe/download`,
		],
	};
});
