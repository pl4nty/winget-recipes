import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

const url = 'https://download.microsoft.com/download/16645fda-2e38-495d-8728-46978c479c1e/PowerAutomateProcessMining_8wekyb3d8bbwe.msixbundle';

export default defineShard(async () => ({
	version: appxVersion(await download(url)),
	urls: () => [url],
}));
