import { defineShard } from 'anthelion';
import { dymoRecords } from '../lib/DYMO.ts';

export default defineShard(async () => {
	const records = await dymoRecords('DYMO PrinterServer Control Center', 'Windows 8.1');
	return { version: { source: 'display' }, urls: () => [records.at(-1)!.url] };
});
