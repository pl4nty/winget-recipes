import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

const url = 'https://download.microsoft.com/download/e/2/e/e2e923b2-7a3a-4730-969d-ab37001fbb5e/MSIXPackagingtoolv1.2024.405.0.msixbundle';

// The Store lists 2024.405.1549.0 as 1.2024.405.0.
export default defineShard(async () => ({
	version: appxVersion(await download(url)).replace(/^(\d+)\.(\d+)\..*$/, '1.$1.$2.0'),
	urls: () => [url],
}));
