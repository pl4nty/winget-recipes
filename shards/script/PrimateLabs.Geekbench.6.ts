import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const blog = 'https://www.primatelabs.com/blog/';
const installer = (version: string) => `https://cdn.geekbench.com/Geekbench-${version}-WindowsSetup.exe`;

async function exists(url: string) {
	const response = await fetch(url, { method: 'HEAD' });
	return response.ok;
}

// geekbench.com blocks CI, so take the newest Geekbench 6 announcement from the Primate Labs blog
// and probe the CDN for its newest patch release.
export default defineShard(async () => {
	const html = await fetch(blog).then((response) => response.text());
	const {
		groups: [path, minor],
	} = match(html, /href="(\/blog\/\d{4}\/\d{2}\/geekbench-6\d+\/)">Geekbench (6\.\d+)</);

	let version: string | undefined;
	for (let patch = 0; patch < 10; patch++) {
		const candidate = `${minor}.${patch}`;
		if (await exists(installer(candidate))) version = candidate;
		else if (version) break;
	}
	if (!version) throw new Error(`no Windows installer found on the CDN for Geekbench ${minor}`);

	return {
		version,
		urls: () => [installer(version)],
		releaseNotes: {
			releaseNotesUrl: new URL(path, blog).href,
		},
	};
});
