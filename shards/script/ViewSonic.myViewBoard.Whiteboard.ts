import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The latest link redirects to a file name whose version differs from the product version; the version comes from the installer.
export default defineShard(async () => {
	const response = await fetch('https://dl.myviewboard.com/latest?64', { headers: { Range: 'bytes=0-0' } });
	await response.body?.cancel();
	const { url } = response;
	match(url, /^(https:\/\/store2\.myviewboard\.com\/uploads\/myViewBoardV3\/myViewBoardV3_[\d.]+_x64\.exe)$/, `Unexpected redirect: ${url}`);

	return { version: { source: 'product' }, urls: () => [{ url, architecture: 'x86' }], state: url, replace: true };
});
