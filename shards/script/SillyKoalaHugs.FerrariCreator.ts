import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download link redirects to a dated upload path without the version; the version comes from the installer.
export default defineShard(async () => {
	const { url } = await fetch('https://sillykoala.eu.org/?sdm_process_download=1&download_id=351', { method: 'HEAD' });
	match(url, /^(https:\/\/sillykoala\.eu\.org\/wp-content\/uploads\/\d{4}\/\d{2}\/ferrari-creator-setup\.exe)$/, `Unexpected redirect: ${url}`);

	return { version: { source: 'product' }, urls: () => [{ url, architecture: 'x64' }], state: url, replace: true };
});
