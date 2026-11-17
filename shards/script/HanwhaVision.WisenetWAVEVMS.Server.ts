import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const data = (await fetch('https://updates.wavevms.com/hanwha/releases.json').then((response) => response.json())) as {
		releases: { product: string; version: string; publication_type: string }[];
	};
	const version = data.releases
		.filter((release) => release.product === 'vms' && release.publication_type === 'release')
		.map((release) => release.version)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No WAVE VMS release found');
	const build = version.split('.').at(-1);

	return {
		version,
		urls: () => [`https://updates.wavevms.com/hanwha/${build}/windows/wave-server-${version}-windows_x64.exe`],
	};
});
