import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page names the newest LTS series ("3.5.x is the most recent LTS
// release series"); the vendor's hashes JSON lists every installer, so take the
// newest Light build of that series and its per-architecture exe and msi URLs.
const page = 'https://slproweb.com/products/Win32OpenSSL.html';
const hashes = 'https://slproweb.com/download/win32_openssl_hashes.json';

type File = { basever: string; subver: string; light: boolean; installer: string; url: string };

const compare = (a: string, b: string) => {
	const x = a.split('.').map(Number);
	const y = b.split('.').map(Number);
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
	}
	return 0;
};

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		captures: { series },
	} = match(html, /(?<series>\d+\.\d+)\.x is (?:the most recent|a) LTS release series/);
	const { files } = (await fetch(hashes).then((response) => response.json())) as { files: Record<string, File> };
	const light = Object.entries(files).filter(
		([, file]) => file.light && file.subver === '' && file.basever.startsWith(`${series}.`),
	);
	const version = light.map(([, file]) => file.basever).sort(compare).at(-1);
	if (!version) throw new Error(`No Light build found for OpenSSL ${series}.x`);

	const url = (prefix: string, type: string) => {
		const found = light.find(([name, file]) => file.basever === version && name.startsWith(`${prefix}OpenSSL_Light-`) && name.endsWith(`.${type}`));
		if (!found) throw new Error(`Missing ${prefix} ${type} for OpenSSL ${version}`);
		return found[1].url;
	};

	return {
		version,
		urls: () => [
			{ url: url('Win32', 'exe'), architecture: 'x86' },
			{ url: url('Win32', 'msi'), architecture: 'x86' },
			{ url: url('Win64', 'exe'), architecture: 'x64' },
			{ url: url('Win64', 'msi'), architecture: 'x64' },
			{ url: url('Win64ARM', 'exe'), architecture: 'arm64' },
			{ url: url('Win64ARM', 'msi'), architecture: 'arm64' },
		],
		replace: true,
	};
});
