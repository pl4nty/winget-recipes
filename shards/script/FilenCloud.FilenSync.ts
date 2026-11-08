import { defineShard } from 'anthelion';
import { electronBuilder } from 'anthelion/strategies';

// The feed also lists universal and arm64 installers; the package ships the x64 one.
export default defineShard(async () => {
	const { version, urls } = await electronBuilder({ url: 'https://cdn.filen.io/@filen/desktop/release/latest/latest.yml' });
	const url = urls.find((url) => url.endsWith('/Filen_win_x64.exe'));
	if (!url) throw new Error('No Filen_win_x64.exe in the Electron Builder feed');

	return { version, urls: () => [url] };
});
