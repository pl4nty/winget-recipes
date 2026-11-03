import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

const url = 'https://download.microsoft.com/download/5/f/0/5f0f8404-9329-44a9-8176-ed6f7f746f25/vclibs_redist_packages.zip';

export default defineShard(async () => ({
	version: appxVersion(await download(url), /Microsoft\.VCLibs\.120\.00_[\d.]+_x64__8wekyb3d8bbwe\.appx$/),
	urls: () => (['x64', 'x86', 'arm'] as const).map((architecture) => ({ url, architecture })),
}));
