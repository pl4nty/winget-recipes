import { defineShard } from 'anthelion';

import { appxVersion, download } from '../../lib/appx';

export default defineShard(async () => {
	const { versions } = await fetch('https://api.nuget.org/v3-flatcontainer/microsoft.ui.xaml/index.json').then(
		(response) => response.json() as Promise<{ versions: string[] }>,
	);
	const latest = versions
		.filter((version) => /^2\.6\.\d+$/.test(version))
		.sort((a, b) => Number(a.split('.')[2]) - Number(b.split('.')[2]))
		.at(-1);
	const url = `https://globalcdn.nuget.org/packages/microsoft.ui.xaml.${latest}.nupkg`;

	return {
		version: appxVersion(await download(url), /^tools\/AppX\/x64\/Release\/Microsoft\.UI\.Xaml\.2\.6\.appx$/),
		urls: () => (['x64', 'x86', 'arm64', 'arm'] as const).map((architecture) => ({ url, architecture })),
	};
});
