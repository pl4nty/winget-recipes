import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { info } = await fetch('https://aka.ms/ssms/22/release/channel').then((response) => response.json());
	const { url } = await fetch('https://aka.ms/ssms/22/release/vs_SSMS.exe', { method: 'HEAD' });

	return {
		version: info.productDisplayVersion,
		urls: () => [url],
	};
});
