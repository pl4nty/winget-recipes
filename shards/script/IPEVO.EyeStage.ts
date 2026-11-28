import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// IPEVO's download page links a SharePoint sharing link. It redirects to the versioned MSI path,
// but that path needs the cookie the sharing link sets, so the sharing link itself is the installer URL.
const sharingLink = 'https://ipevo0.sharepoint.com/:u:/s/For/ESNR6Q1MokVAu0DFopnDKJ4BpKtLC1tTcO0SmT57Y6S1Ew?e=pktwbn&download=1';

export default defineShard(async () => {
	const response = await fetch(sharingLink, { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const version = match(location, /\/EyeStage\/Win\/IPEVO_EYESTAGE_win10-11_v(\d+(?:\.\d+)+)\.msi/).groups[0];

	return {
		version,
		urls: () => [sharingLink],
	};
});
