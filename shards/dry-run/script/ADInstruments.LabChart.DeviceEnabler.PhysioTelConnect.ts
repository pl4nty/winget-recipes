import { defineShard } from 'anthelion';

import { adinstrumentsApp, labChartApps } from '../lib/ADInstruments.ts';

export default defineShard(async () => {
	const app = await adinstrumentsApp(labChartApps, 'PhysioTelConnect');
	return { version: { source: 'display' }, urls: () => [new URL(app.DownloadURL!, 'https://cdn.adinstruments.com/').href] };
});
