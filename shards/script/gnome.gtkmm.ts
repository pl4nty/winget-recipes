import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://download.gnome.org/binaries/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// Builds are grouped in series directories (2.22/) per architecture, and versions carry a build
// suffix (2.22.0-2), so the series and the newest 64-bit build are discovered and the 32-bit build must match.
export default defineShard(async () => {
	const series = [...(await getText(`${base}win64/gtkmm/`)).matchAll(/href="(\d+\.\d+)\/"/gi)]
		.map(([, v]) => v as string)
		.toSorted((a, b) => compareVersions(b, a))[0];
	if (!series) throw new Error('no gtkmm series found');
	const version = [
		...(await getText(`${base}win64/gtkmm/${series}/`)).matchAll(
			/href="gtkmm-win64-devel-(\d+(?:\.\d+)+-\d+)\.exe"/gi,
		),
	]
		.map(([, v]) => v as string)
		.toSorted((a, b) => compareVersions(b.replace('-', '.'), a.replace('-', '.')))[0];
	if (!version) throw new Error(`no gtkmm installer found in ${series}`);

	return {
		version,
		urls: () => [
			`${base}win64/gtkmm/${series}/gtkmm-win64-devel-${version}.exe`,
			`${base}win32/gtkmm/${series}/gtkmm-win32-devel-${version}.exe`,
		],
	};
});
