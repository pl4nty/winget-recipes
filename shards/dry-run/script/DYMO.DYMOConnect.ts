import { defineShard } from 'anthelion';
import { dymoRecords } from '../lib/DYMO.ts';

export default defineShard(async () => {
	const records = await dymoRecords('DYMO Connect for Desktop', 'Windows 11');
	const url = (architecture: string) => records.findLast((record) => record.architecture === architecture)?.url;
	const [x64, arm64] = [url('64'), url('ARM')];
	if (!x64) throw new Error('No x64 download');
	return { version: { source: 'display' }, urls: () => [x64, ...(arm64 ? [arm64] : [])] };
});
