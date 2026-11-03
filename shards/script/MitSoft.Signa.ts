import { defineShard } from 'anthelion';

// The Signa Desktop page links dated MSIs (Signa_v1.3_2026-08-31_lt_jre.msi),
// sometimes an older one too. The newest date wins, and the package version
// joins the product version with the date: 1.3.2026.0831.
export default defineShard(async () => {
	const html = await fetch('https://www.mitsoft.lt/lt/sprendimai/signa-desktop').then((response) =>
		response.text(),
	);
	const files = [...html.matchAll(/Signa_v(\d+\.\d+)_(\d{4})-(\d{2})-(\d{2})_lt_jre\.msi/g)].map(([file, product, year, month, day]) => ({
		file,
		product,
		date: `${year}${month}${day}`,
		version: `${product}.${year}.${month}${day}`,
	}));
	const latest = files.sort((a, b) => b.date.localeCompare(a.date))[0];
	if (!latest) throw new Error('No Signa MSI link found');

	return {
		version: latest.version,
		urls: () => [`https://www.mitsoft.lt/sites/mitsoft/files/${latest.file}`],
	};
});
