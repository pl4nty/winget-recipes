import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Windows builds are named ePSXe<major><minor><patch>.zip (e.g. ePSXe205.zip for 2.0.5).
export default defineShard(async () => {
	const page = await fetch('https://www.epsxe.com/download.php').then((response) => response.text());
	const latest = [...page.matchAll(/files\/ePSXe(\d)(\d)(\d)\.zip/gi)]
		.map((m) => ({ file: m[0].slice('files/'.length), version: `${m[1]}.${m[2]}.${m[3]}` }))
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) throw new Error('No ePSXe Windows zip found on the download page');

	return {
		version: latest.version,
		urls: () => [`https://www.epsxe.com/files/${latest.file}`],
	};
});
