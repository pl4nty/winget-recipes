import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://download.gnome.org/binaries/win32/planner/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

const newest = (versions: string[]) => versions.toSorted((a, b) => compareVersions(b, a))[0];

// Windows builds are grouped in series directories (0.14/), so the series and the installer are both discovered.
export default defineShard(async () => {
	const series = newest(
		[...(await getText(base)).matchAll(/href="(\d+\.\d+)\/"/gi)].map(([, v]) => v as string),
	);
	if (!series) throw new Error('no Planner series found');
	const version = newest(
		[...(await getText(`${base}${series}/`)).matchAll(/href="planner-(\d+(?:\.\d+)+)\.exe"/gi)].map(
			([, v]) => v as string,
		),
	);
	if (!version) throw new Error(`no Planner installer found in ${series}`);

	return {
		version,
		urls: () => [`${base}${series}/planner-${version}.exe`],
	};
});
