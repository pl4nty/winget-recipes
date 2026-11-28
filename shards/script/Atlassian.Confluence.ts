import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Atlassian's download feeds mark Long Term Support releases as the "Enterprise" edition.
// The current feed holds only the newest feature release, so the latest LTS can be in the archived feed.
type Download = { edition: string; platform: string; version: string; zipUrl: string; releaseNotes?: string };

export default defineShard(async () => {
	const feeds = await Promise.all(
		['current', 'archived'].map((feed) =>
			fetch(`https://my.atlassian.com/download/feeds/${feed}/confluence.json`).then((response) => response.json() as Promise<Download[]>),
		),
	);
	const installers = feeds
		.flat()
		.filter((download) => download.edition === 'Enterprise' && download.platform === 'Windows' && download.zipUrl.endsWith('-x64.exe'));
	const latest = installers.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!latest) throw new Error('No Confluence LTS Windows installer in the Atlassian feeds');

	return {
		version: latest.version,
		urls: () => [latest.zipUrl],
		...(latest.releaseNotes && { releaseNotes: { releaseNotesUrl: latest.releaseNotes } }),
	};
});
