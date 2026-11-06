import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Newer inbox-preview releases ship only the Tools and Transports installers.
const INSTALLER = /^Windows\.MIDI\.Services\.SDK\.Runtime\.and\.Tools\.(.+)-(?:arm64|x64)\.exe$/;

export default defineShard(async () => {
	const { data } = await githubClient.rest.repos.listReleases({ owner: 'microsoft', repo: 'MIDI', per_page: 100 });
	const assets = data.find((release) => release.assets.some(({ name }) => INSTALLER.test(name)))!.assets.filter(({ name }) => INSTALLER.test(name));

	return {
		version: match(assets[0]!.name, INSTALLER).groups[0],
		urls: () => assets.map((asset) => asset.browser_download_url),
	};
});
