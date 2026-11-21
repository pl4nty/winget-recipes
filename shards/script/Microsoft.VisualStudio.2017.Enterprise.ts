import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { info } = await fetch('https://aka.ms/vs/15/release/channel').then((response) => response.json());
	const { url } = await fetch('https://aka.ms/vs/15/release/vs_Enterprise.exe', { method: 'HEAD' });

	return {
		version: info.productDisplayVersion,
		urls: () => [{ url: url, architecture: 'x64' }],
	};
});
