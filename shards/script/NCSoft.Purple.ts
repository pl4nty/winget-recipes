import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The Purple download page (purple.plaync.com/download) reads its installer link from this
// content API. The link names the version with underscores (PURPLE_Installer_2_26_1019_7.exe).
export default defineShard(async () => {
	const contents = await fetch(
		'https://purple-api.plaync.com/api/categories/purpleWeb/contents/purple-store?keySets=purple-download-info',
	).then((response) => response.json());
	const url: string = contents['purple-download-info'].download_info.download_link[0].pc.windowsLink;
	const {
		groups: [underscored],
	} = match(url, /\/PURPLE_Installer_(\d+(?:_\d+)+)\.exe$/);

	return {
		version: underscored.replaceAll('_', '.'),
		urls: () => [url],
	};
});
