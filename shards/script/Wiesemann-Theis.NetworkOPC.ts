import { defineShard } from 'anthelion';

// The product pages link the current setup as e-5wwww-17-swww-<code>.exe, where the code
// is the version without its dot (493 is 4.93). The German page is updated first, so the
// highest code across the German and English pages wins. The per-language MSIs that
// upstream lists use the same code; they are kept first when the vendor has posted them,
// followed by the worldwide setup exe that bundles both languages.
const site = 'https://www.wut.de';

export default defineShard(async () => {
	const pages = await Promise.all(
		['e-5wwww-10-inde-000.php', 'e-5wwww-10-inus-000.php'].map((page) =>
			fetch(`${site}/${page}`).then((response) => response.text()),
		),
	);
	const codes = pages.flatMap((page) => [...page.matchAll(/e-5wwww-17-swww-(\d{3,})\.exe/g)].map(([, code]) => code!));
	const code = codes.sort((a, b) => Number(b) - Number(a))[0];
	if (!code) throw new Error('No OPC Server setup found');

	const msis = [`${site}/download/tools/e-5wwww-17-swde-${code}.msi`, `${site}/download/tools/e-5wwww-17-swus-${code}.msi`];
	const posted = await Promise.all(msis.map((url) => fetch(url, { method: 'HEAD' }).then((response) => response.ok)));

	return {
		version: `${code.slice(0, 1)}.${code.slice(1)}`,
		urls: () => [...msis.filter((_, index) => posted[index]), `${site}/download/tools/e-5wwww-17-swww-${code}.exe`],
	};
});
