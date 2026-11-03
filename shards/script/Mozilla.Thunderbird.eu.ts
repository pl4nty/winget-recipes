import { defineShard } from 'anthelion';

// Release notes come from Thunderbird's own notes repository, which backs the
// release notes page. They are passed to the plain-text source as a data: URL
// so the page's navigation is left out.
const headings: Record<string, string> = {
	new: 'What’s New',
	changed: 'What’s Changed',
	fixed: 'What’s Fixed',
	unresolved: 'Known Issues',
};

export default defineShard(async () => {
	const { LATEST_THUNDERBIRD_VERSION: version } = await fetch(
		'https://product-details.mozilla.org/1.0/thunderbird_versions.json',
	).then((response) => response.json());
	const base = `https://download-installer.cdn.mozilla.net/pub/thunderbird/releases/${version}`;
	const releaseNotesUrl = `https://www.thunderbird.net/thunderbird/${version}/releasenotes/`;

	const notes = await fetch(`https://raw.githubusercontent.com/thunderbird/thunderbird-notes/master/release/${version}.yml`)
		.then(async (response) => (response.ok ? (Bun.YAML.parse(await response.text()) as { notes?: { note: string; tag: string }[] }).notes : undefined))
		.catch(() => undefined);
	const text = Object.entries(headings)
		.map(([tag, heading]) => {
			const items = (notes ?? []).filter((note) => note.tag === tag).map((note) => `- ${note.note.trim()}`);
			return items.length ? `${heading}\n${items.join('\n')}` : '';
		})
		.filter(Boolean)
		.join('\n');

	return {
		version,
		urls: () => [
			`${base}/win32/eu/Thunderbird%20Setup%20${version}.exe`,
			`${base}/win64/eu/Thunderbird%20Setup%20${version}.exe`,
			`${base}/win32/eu/Thunderbird%20Setup%20${version}.msi`,
			`${base}/win64/eu/Thunderbird%20Setup%20${version}.msi`,
		],
		releaseNotes: text
			? { source: 'plain-text', sourceUrl: `data:text/plain,${encodeURIComponent(text)}`, releaseNotesUrl, cleanup: false }
			: { releaseNotesUrl },
	};
});
