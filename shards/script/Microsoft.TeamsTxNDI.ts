import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

const url = 'https://teams.microsoft.com/core-calling-lib/2024.8.1.14/ndi-win-x64_vs2022-crtdynamic-release.msix';

export default defineShard(async () => ({
	version: appxVersion(await download(url)),
	urls: () => [url],
}));
