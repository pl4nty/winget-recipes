import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getReleaseByTag({ owner: 'bsnes-emu', repo: 'bsnes', tag: 'nightly' });
	const asset = release.assets.find(({ name }) => name === 'bsnes-windows.zip');
	if (!asset) throw new Error('No bsnes-windows.zip asset on the nightly release');

	return {
		version: asset.updated_at.slice(0, 10),
		urls: () => [asset.browser_download_url],
		replace: true,
	};
});
