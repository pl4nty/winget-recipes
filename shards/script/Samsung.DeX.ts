import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link redirects twice, to a path named by date and file id, not the version; the version comes from the installer.
export default defineShard(async () => {
	const { url } = await fetch('https://www.samsung.com/global/download/SamsungDeXWin/', { method: 'HEAD' });
	match(url, /^(https:\/\/downloadcenter\.samsung\.com\/content\/SW\/\d{6}\/\d+\/SamsungDeXSetupWin\.exe)$/, `Unexpected redirect: ${url}`);

	return { version: { source: 'product' }, urls: () => [url], state: url, replace: true };
});
