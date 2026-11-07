import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const base = 'https://download.gnome.org/binaries/win32/glade/';
	const series = [...(await fetch(base).then((response) => response.text())).matchAll(/href="(\d+\.\d+)\/"/g)].map(([, value]) => value!);
	const latest = series.sort(compareVersions).at(-1);
	if (!latest) throw new Error('No Glade release series found');
	const listing = await fetch(`${base}${latest}/`).then((response) => response.text());
	const files = [...listing.matchAll(/href="glade-(\d+(?:-\d+)+)-installer\.exe"/g)].map(([, value]) => value!);
	const file = files.sort((a, b) => compareVersions(a.replaceAll('-', '.'), b.replaceAll('-', '.'))).at(-1);
	if (!file) throw new Error('No Glade installer found');

	return {
		version: file.replaceAll('-', '.'),
		urls: () => [`${base}${latest}/glade-${file}-installer.exe`],
	};
});
