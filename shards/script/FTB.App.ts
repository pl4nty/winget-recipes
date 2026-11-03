import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { electronBuilder } from 'anthelion/strategies';

// The changes page lists every version; only the current version's entry is
// passed to the html source, as a data: URL.
const changes = 'https://www.feed-the-beast.com/ftb-app/changes';

export default defineShard(async () => {
	const { version, urls } = await electronBuilder({ url: 'https://piston.feed-the-beast.com/app/latest.yml' });
	const html = await fetch(changes).then((response) => response.text());
	const escaped = version.replaceAll('.', '\\.');
	const {
		groups: [entry],
	} = match(
		html,
		new RegExp(`<h2[^>]*id="${escaped}"[^>]*>[\\s\\S]*?<div class="changelog wysiwyg">([\\s\\S]*?)(?=<div class="[^"]*changeLogEntry|</main>|$)`),
	);

	return {
		version,
		urls: () => urls,
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<div>${entry}</div>`)}`,
			releaseNotesUrl: changes,
			cleanup: false,
		},
	};
});
