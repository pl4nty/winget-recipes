import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const page = 'https://administracionelectronica.gob.es/ctt/clienteafirma/descargas';
	const html = await text(page);
	const links = [...html.matchAll(/href="([^"]*Auto[Ff]irma[^"]*\.zip)"/g)].map(([, href]) => new URL(href!.replaceAll('&amp;', '&'), page).href);
	const pick = (bits: string, msi: boolean) => {
		const url = links.find((url) => url.includes(bits) && url.includes('MSI') === msi);
		if (!url) throw new Error(`No ${bits}-bit ${msi ? 'MSI' : 'EXE'} link`);
		return url;
	};
	const urls = [pick('64', false), pick('64', true), pick('32', false), pick('32', true)];
	const {
		groups: [major, minor, patch],
	} = match(urls[0], /\/(\d+)\/(\d+)\/(\d+)\//);
	const version = patch === '0' ? `${major}.${minor}` : `${major}.${minor}.${patch}`;
	const nested = `v${version.replaceAll('.', '_')}_installer`;
	return {
		version,
		urls: () => [
			{ url: urls[0], nestedInstallerMatches: [`AutoFirma_64_${nested}.exe`] },
			{ url: urls[1], nestedInstallerMatches: [`AutoFirma_64_${nested}.msi`] },
			{ url: urls[2], nestedInstallerMatches: [`AutoFirma_32_${nested}.exe`] },
			{ url: urls[3], nestedInstallerMatches: [`AutoFirma_32_${nested}.msi`] },
		],
	};
});
