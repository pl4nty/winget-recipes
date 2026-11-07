import { defineShard } from 'anthelion';

// tapatch.com publishes every tool's current version, installer path and
// changelog in tools.json (the same data TA Hub and the product pages use).
// The changelog list is passed to the html source as a data: URL.
const page = 'https://tapatch.com/tools/tahub/';

type Tool = { id: string; version: string; downloadExe: string; changelog: string[] };

export default defineShard(async () => {
	const tools: Tool[] = await fetch('https://tapatch.com/tools.json').then((response) => response.json());
	const tool = tools.find(({ id }) => id === 'tahub');
	if (!tool) throw new Error('tahub not found in tools.json');
	const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const notes = `<ul>${tool.changelog.map((line) => `<li>${escape(line)}</li>`).join('')}</ul>`;

	return {
		version: tool.version,
		urls: () => [new URL(tool.downloadExe, 'https://tapatch.com/').href],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});
