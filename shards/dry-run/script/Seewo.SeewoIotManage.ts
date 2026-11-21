import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

type App = { packageCode: string; softInfos: { softVersion: string; downloadUrl: string }[] };

export default defineShard(async () => {
	const {
		groups: [encoded],
	} = match(await text('https://e.seewo.com/'), /var apps_str = '(.+?)';/);
	const json = encoded.replace(/&(quot|amp|lt|gt|#39);/g, (_, entity: string) => ({ quot: '"', amp: '&', lt: '<', gt: '>', '#39': "'" })[entity]!);
	const app = (JSON.parse(json) as App[]).find(({ packageCode }) => packageCode === 'SeewoIotManageWebApp');
	if (!app) throw new Error('No SeewoIotManageWebApp entry');
	const [{ softVersion, downloadUrl }] = app.softInfos as [App['softInfos'][number]];
	return { version: softVersion, urls: () => [downloadUrl] };
});
