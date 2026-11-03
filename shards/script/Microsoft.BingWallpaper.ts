import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

const url = 'https://download.microsoft.com/download/3c0e11a1-2e57-4bc3-b877-1a04248078a4/W011/0x00005001/BingWallpaper_1.1.459.0_x86.msix';

export default defineShard(async () => ({
	version: appxVersion(await download(url)).replace(/\.0$/, ''),
	urls: () => [url],
}));
