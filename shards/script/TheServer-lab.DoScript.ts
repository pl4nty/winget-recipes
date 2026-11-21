import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'TheServer-lab',
		repo: 'DoScript',
		tag: 'latest-release',
	});
	const deb = release.assets.find((a) => /^doscript_\d+(?:\.\d+)+-linux_amd64\.deb$/.test(a.name));
	const setup = release.assets.find((a) => a.name === 'DoScriptSetup.exe');
	if (!deb || !setup) throw new Error('No doscript_<version>-linux_amd64.deb or DoScriptSetup.exe asset on the latest-release release');
	const version = deb.name.replace(/^doscript_/, '').replace(/-linux_amd64\.deb$/, '');

	return {
		version,
		urls: () => [setup.browser_download_url],
		replace: true,
	};
});
