import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page reads two electron-builder feeds: latest.yml (x86) and
// win64/latest.yml (x64). Each names its installer, relative to the feed.
const prefix = 'https://static.codemao.cn/wood/client/production/';

async function feed(dir: string) {
	const text = await fetch(`${prefix}${dir}latest.yml?time=${Date.now()}`).then((response) => response.text());
	const {
		captures: { version, path },
	} = match(text, /^version: (?<version>\S+)[\s\S]*?^path: (?<path>.+\.exe)$/m);
	return { version, url: `${prefix}${dir}${encodeURIComponent(path.trim())}` };
}

export default defineShard(async () => {
	const [x86, x64] = await Promise.all([feed(''), feed('win64/')]);
	if (x86.version !== x64.version) {
		throw new Error(`Feed versions differ: x86 ${x86.version}, x64 ${x64.version}`);
	}

	return {
		version: x64.version,
		urls: () => [
			{ url: x86.url, architecture: 'x86' },
			{ url: x64.url, architecture: 'x64' },
		],
	};
});
