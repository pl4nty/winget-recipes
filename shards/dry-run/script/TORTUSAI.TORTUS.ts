import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const page = 'https://tortus.ai/download/';
	const [exe, msi] = await Promise.all([link(page, /\.exe/), link(page, /\.msi/)]);
	const [versionExe, versionMsi] = [exe, msi].map((url) => match(url, /_(\d+(?:\.\d+)+)_/).groups[0]);
	if (versionExe !== versionMsi) throw new Error(`Inconsistent versions: exe ${versionExe}, msi ${versionMsi}`);
	return { version: versionMsi!, urls: () => [exe, msi] };
});
