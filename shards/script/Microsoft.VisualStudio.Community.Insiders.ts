import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { info } = await fetch('https://aka.ms/vs/18/insiders/channel').then((response) => response.json());
	const { url } = await fetch('https://aka.ms/vs/18/insiders/vs_Community.exe', { method: 'HEAD' });

	return {
		version: info.buildVersion,
		urls: () => [url],
	};
});
