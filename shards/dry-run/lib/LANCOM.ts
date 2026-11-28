import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from './fetch.ts';

// LANCOM file names pad version parts with zeros (10.94.0052), the manifests do not.
export function lancom(file: RegExp) {
	return defineShard(async () => {
		const url = await link('https://my.lancom-systems.com/downloads/', file);
		const {
			groups: [version],
		} = match(url, /-(\d+(?:\.\d+)+)-/);
		return { version: version.replace(/(?<=^|\.)0+(?=\d)/g, ''), urls: () => [url] };
	});
}
