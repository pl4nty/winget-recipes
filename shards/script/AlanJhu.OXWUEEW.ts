import { defineShard } from 'anthelion';
import { electronBuilder } from 'anthelion/strategies';

// Each architecture has its own Electron Builder feed.
export default defineShard(async () => {
	const [x64, x86] = await Promise.all([
		electronBuilder({ url: 'https://eew.earthquake.tw/releases/win/x64/latest.yml' }),
		electronBuilder({ url: 'https://eew.earthquake.tw/releases/win/ia32/latest.yml' }),
	]);
	if (x64.version !== x86.version) throw new Error(`Feed versions differ: ${x64.version} and ${x86.version}`);

	return {
		version: x64.version,
		urls: () => [
			...x64.urls.map((url) => ({ url, architecture: 'x64' as const })),
			...x86.urls.map((url) => ({ url, architecture: 'x86' as const })),
		],
	};
});
