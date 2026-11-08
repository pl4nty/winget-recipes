import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'beyondtranslate', repo: 'beyondtranslate-ce', assetRegex: 'windows-setup\\.exe$' });
	const [url] = release.urls();
	const {
		groups: [version],
	} = match(url, /-(\d+\.\d+\.\d+\+\d+)-windows-setup\.exe$/);
	return { version, urls: () => [url!] };
});
