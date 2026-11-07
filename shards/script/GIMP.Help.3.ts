import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The help installers live in one folder per minor release
// (windows/3.0/, windows/3.2/), one installer per language. Upstream lists the
// languages in this order; languages the vendor adds later go at the end.
const base = 'https://download.gimp.org/gimp/help/windows';
const order = 'zh_CN uk tr sv sl sk ru ro pt_BR pt pl nn nl lt ko ja it hu hr fr fi fa es eo en en_GB el de da cs ca bg'.split(' ');

const listing = (url: string) => fetch(url).then((response) => response.text());

export default defineShard(async () => {
	const folders = [...(await listing(`${base}/`)).matchAll(/href="(3\.\d+)\/"/g)].map((m) => m[1]);
	const folder = folders.sort(compareVersions).at(-1);
	const files = [...(await listing(`${base}/${folder}/`)).matchAll(/href="gimp-help-(\d+(?:\.\d+)+)-([A-Za-z_]+)-setup\.exe"/g)];
	const version = files.map((m) => m[1]).sort(compareVersions).at(-1)!;
	const languages = [...new Set(files.filter((m) => m[1] === version).map((m) => m[2]))];
	const sorted = [...order.filter((l) => languages.includes(l)), ...languages.filter((l) => !order.includes(l)).sort()];

	return {
		version,
		urls: () => sorted.map((l) => ({ url: `${base}/${folder}/gimp-help-${version}-${l}-setup.exe`, architecture: 'x86' as const })),
	};
});
