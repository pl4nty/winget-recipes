import { defineShard } from 'anthelion';
import { dymoRecords } from '../lib/DYMO.ts';

export default defineShard(async () => {
	const records = await dymoRecords('DYMO Label Software', 'Windows 11');
	return { version: { source: 'display' }, urls: () => [records.at(-1)!.url] };
});
