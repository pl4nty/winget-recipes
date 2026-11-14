import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

// Sky's update API needs a client certificate, so read the public download pages instead.
const pages = {
	gb: 'https://www.sky.com/watch/sky-go/windows',
	de: 'https://www.sky.de/sky-go',
	it: 'https://www.sky.it/skygo',
	at: 'https://www.sky.at/sky-x',
};

export default defineShard(async () => {
	const urls = await Promise.all(Object.entries(pages).map(([country, page]) => link(page, new RegExp(`Sky\\w+_production_[\\d.]+_${country}_production\\.exe`))));
	const versions = new Set(urls.map((url) => match(url, /_production_(\d+(?:\.\d+)+)_/).groups[0]));
	if (versions.size > 1) throw new Error(`Inconsistent versions: ${[...versions].join(', ')}`);
	return { version: [...versions][0]!, urls: () => urls };
});
