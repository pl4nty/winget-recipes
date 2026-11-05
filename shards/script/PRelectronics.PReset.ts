import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer lives under an Umbraco media folder whose name changes with each
// upload, so read both the folder and the version from the product page.
const page = 'https://www.prelectronics.com/downloads/software/preset-software/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { path },
	} = match(html, /\/media\/(?<path>[a-z0-9]+)\/preset\.exe/i);
	const {
		captures: { version },
	} = match(html, /PReset\s+(?:version\s+|v)?(?<version>\d+\.\d+\.\d{3,})/i);

	return {
		version,
		urls: () => [{ url: `https://www.prelectronics.com/media/${path}/preset.exe`, architecture: 'x86' }],
	};
});
