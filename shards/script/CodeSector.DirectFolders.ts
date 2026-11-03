import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The downloads page lists the current version; the matching blog post holds the
// changelog, which is passed to the html source as a data: URL so the rest of the
// post (download link, hashes, sidebar) is left out.
export default defineShard(async () => {
	const downloads = await fetch('https://codesector.com/downloads').then((response) => response.text());
	const {
		groups: [version],
	} = match(downloads, /Direct Folders (\d+(?:\.\d+)+)\s*<\/td>/);

	const category = await fetch('https://blog.codesector.com/category/directfolders/').then((response) =>
		response.text(),
	);
	const escaped = version.replaceAll('.', '\\.');
	const post = new RegExp(`<a href="(https://blog\\.codesector\\.com/[^"]+)"[^>]*>Direct Folders ${escaped}</a>`).exec(
		category,
	)?.[1];

	let releaseNotes;
	if (post) {
		const html = await fetch(post).then((response) => response.text());
		const notes = /<div class="entry-content[^"]*">([\s\S]*?)<p[^>]*>Download:/.exec(html)?.[1];
		if (notes) {
			releaseNotes = {
				source: 'html' as const,
				sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
				releaseNotesUrl: post,
				cleanup: false,
			};
		}
	}

	return {
		version,
		urls: () => [
			{ url: `https://codesector.com/files/directfolders${version}.exe`, architecture: 'x86' as const },
			{ url: `https://codesector.com/files/directfolders${version}.exe`, architecture: 'x64' as const },
		],
		releaseNotes,
	};
});
