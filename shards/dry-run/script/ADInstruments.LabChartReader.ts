import { defineShard } from 'anthelion';

import { adinstrumentsApp } from '../lib/ADInstruments.ts';

export default defineShard(async () => {
	const app = await adinstrumentsApp('https://www.adinstruments.com/LabChartReader8SoftwareUpdateWin.plist', 'LabChartReader', '5129');
	return { version: { source: 'display' }, urls: () => [new URL(app.DownloadURL!, 'https://cdn.adinstruments.com/').href] };
});
