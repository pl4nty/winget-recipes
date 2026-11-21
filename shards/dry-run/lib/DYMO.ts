import { compareVersions, match } from 'anthelion/helpers';
import { text } from './fetch.ts';

type Record = { software: string; osVersion: string; version: string; architecture: string; url: string };

// The compatibility chart embeds every DYMO download as JSON.
export async function dymoRecords(software: string, osVersion: string) {
	const {
		groups: [json],
	} = match(await text('https://www.dymo.com/dymo-compatibility-chart.html'), /<script[^>]*data-dymo-v2-data[^>]*>([\s\S]*?)<\/script>/, 'No download data on the DYMO chart (the page needs a browser)');
	const records = (JSON.parse(json) as { records: Record[] }).records.filter((record) => record.software === software && record.osVersion === osVersion);
	if (!records.length) throw new Error(`No ${software} downloads for ${osVersion}`);
	const latest = records.map(({ version }) => version).sort((a, b) => compareVersions(b, a))[0]!;
	return records.filter(({ version }) => version === latest).map((record) => ({ ...record, url: decodeURI(record.url).replace(/^http:/, 'https:') }));
}
