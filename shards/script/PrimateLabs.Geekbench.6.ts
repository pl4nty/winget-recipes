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

	// The announcement's body becomes the release notes; it is passed to the html source as a
	// data: URL so the blog's navigation and sidebar are left out.
	const post = new URL(path, blog).href;
	const {
		groups: [content],
	} = match(
		await fetch(post).then((response) => response.text()),
		/<div class="blog-content">([\s\S]*?)<\/div>/,
		'blog post content not found',
	);

	return {
		version,
		urls: () => [installer(version)],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(content)}`,
			releaseNotesUrl: post,
			cleanup: false,
		},
	};
});
