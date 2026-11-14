import { defineShard } from 'anthelion';
import { resolve } from '../lib/fetch.ts';

export default defineShard(async () => {
	const { data } = (await fetch('https://www.tominlab.com/api/product/check-update?app=wonderpen').then((response) => response.json())) as { data: { version: string } };
	const urls = await Promise.all(['win-ia32', 'win-x64'].map((key) => resolve(`https://www.tominlab.com/to/get-file/wonderpen?key=${key}`)));
	for (const url of urls) if (!url.includes(data.version)) throw new Error(`${url} does not contain version ${data.version}`);
	return { version: data.version, urls: () => urls };
});
