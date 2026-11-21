import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The homepage names the latest version; /download redirects to the versioned
// installer (rbib261.exe for 2.6.1.0), so take the URL from that redirect.
const site = 'https://rbiblia.toborek.info';

export default defineShard(async () => {
	const html = await fetch(`${site}/`).then((response) => response.text());
	const {
		captures: { version },
	} = match(html, /Najnowsza wersja programu to:\s*<strong>(?<version>\d+(?:\.\d+)+)<\/strong>/);
	const redirect = await fetch(`${site}/download`, { redirect: 'manual' });
	const location = redirect.headers.get('location');
	if (!location) throw new Error(`No redirect from ${site}/download (HTTP ${redirect.status})`);
	const url = new URL(location, site).href;
	if (!/\/rbib\d+\.exe$/.test(url)) throw new Error(`Unexpected installer URL ${url}`);

	return {
		version,
		urls: () => [url],
		replace: true,
	};
});
