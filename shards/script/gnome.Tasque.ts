import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://download.gnome.org/binaries/win32/tasque';

// Builds live in per-series folders (<major>.<minor>/TasqueSetup_<version>.msi).
const latest = (items: string[]) => items.sort(compareVersions).at(-1);

export default defineShard(async () => {
	const index = await fetch(`${base}/`).then((response) => response.text());
	const series = latest([...index.matchAll(/href="(\d+(?:\.\d+)+)\/"/g)].map((m) => m[1]));
	if (!series) throw new Error('No Tasque series folder found');

	const listing = await fetch(`${base}/${series}/`).then((response) => response.text());
	const version = latest([...listing.matchAll(/href="TasqueSetup_(\d+(?:\.\d+)+)\.msi"/g)].map((m) => m[1]));
	if (!version) throw new Error(`No Tasque MSI found in ${series}`);

	return {
		version,
		urls: () => [`${base}/${series}/TasqueSetup_${version}.msi`],
	};
});
