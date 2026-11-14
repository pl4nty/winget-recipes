import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const urls = await Promise.all(['128', '127'].map((id) => link(`https://downloads.nomachine.com/download/?id=${id}`, /\.exe/)));
	const [x86, x64] = urls.map((url) => match(url, /_(\d+(?:\.\d+)+)_\d+_x(?:86|64)\.exe/).groups[0]);
	if (x86 !== x64) throw new Error(`Inconsistent versions: x86 ${x86}, x64 ${x64}`);
	return { version: x64!, urls: () => urls };
});
