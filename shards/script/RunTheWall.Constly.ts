import { defineShard } from 'anthelion';

// Version and installer come from the Tauri updater feed. The release notes are
// the matching section of the vendor's CHANGELOG.md, passed as a data: URL.
export default defineShard(async () => {
	const feed = await fetch('https://downloads.constly.com/latest.json').then((response) => response.json());
	const version: string = feed.version;

	const changelog = await fetch('https://raw.githubusercontent.com/RunTheWall/constly-app/main/CHANGELOG.md').then((response) =>
		response.text(),
	);
	const sections = changelog.split(/^(?=## )/m);
	const section = sections.find((part) => part.startsWith(`## ${version} `) || part.startsWith(`## ${version}\n`));
	if (!section) throw new Error(`No CHANGELOG.md section for ${version}`);
	const [heading, ...body] = section.split('\n');
	const anchor = heading
		.replace(/^## /, '')
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N} _-]/gu, '')
		.replace(/ /g, '-');

	return {
		version,
		urls: () => [feed.platforms['windows-x86_64'].url],
		releaseNotes: {
			source: 'markdown',
			sourceUrl: `data:text/markdown,${encodeURIComponent(body.join('\n').trim())}`,
			releaseNotesUrl: `https://github.com/RunTheWall/constly-app/blob/main/CHANGELOG.md#${anchor}`,
			cleanup: false,
		},
	};
});
