import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Insta360's download API lists every Insta360 Studio build (app_id 38) for each platform,
// betas included, so the newest non-beta Windows item is picked by version.
type Channel = { channel: string; download_url: string };
type Item = { platform: string; version: string; channels: Channel[] };
type Response = { data: { apps: { app_id: number; items: Item[] }[] } };

export default defineShard(async () => {
	const response: Response = await fetch(
		'https://openapi.insta360.com/app/appDownload/getGroupApp?group=insta360-go2&X-Language=en-us',
	).then((r) => r.json());
	const official = (item: Item) => item.channels.find((channel) => channel.channel === 'official')?.download_url;
	const item = response.data.apps
		.find((app) => app.app_id === 38)
		?.items.filter(
			(item) =>
				item.platform === 'windows' && /^\d+(?:\.\d+)+$/.test(item.version) && !/beta/i.test(official(item) ?? 'beta'),
		)
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	const url = item && official(item);
	if (!item || !url) throw new Error('No Insta360 Studio Windows download found');

	return {
		version: item.version,
		urls: () => [url],
	};
});
