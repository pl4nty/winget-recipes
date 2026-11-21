import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'yyqh01', repo: 'reaper_actuator', kind: 'all' });
	const asset = release.assets.find((asset) => /^REAPERActionCommandActuator_.*\.exe$/i.test(asset.name));
	const {
		captures: { version },
	} = match(asset?.name, /^REAPERActionCommandActuator_\d{4}\.\d{2}\.\d{2}\.(?<version>\d+(?:\.\d+)*)\.exe$/i);

	return {
		version,
		urls: () => [{ url: asset!.browser_download_url, architecture: 'x64' }],
		releaseNotes: { releaseNotesUrl: 'https://github.com/yyqh01/reaper_actuator/releases/tag/snapshot' },
	};
});
