import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// Every release gets a news post (news/doom_explorer_2_66/...) and an
// "installer" item in the downloads category (doom_explorer_2_66_installer/4-1-0-233).
// The item's /load/0-0-0-<id>-20 link redirects to the zip that holds the setup.
const site = 'https://doomutils.ucoz.com';

const text = (url: string) => fetch(url).then((response) => response.text());

export default defineShard(async () => {
	const news = await text(`${site}/news/`);
	const posts = [...news.matchAll(/\/news\/doom_explorer_(\d+)_(\d+)\/[\d-]+/g)].map((post) => ({
		version: `${post[1]}.${post[2]}`,
		path: post[0],
	}));
	if (posts.length === 0) {
		throw new Error('No Doom Explorer news posts found');
	}
	const latest = posts.reduce((a, b) => (compareVersions(a.version, b.version) >= 0 ? a : b));
	const version = latest.version;
	const slug = version.replace('.', '_');

	const downloads = await text(`${site}/load/doom_explorer/4`);
	const {
		captures: { id },
	} = match(downloads, new RegExp(`/doom_explorer_${slug}_installer/4-1-0-(?<id>\\d+)`), `No ${version} installer item`);
	const redirect = await fetch(`${site}/load/0-0-0-${id}-20`, { redirect: 'manual' });
	const location = redirect.headers.get('location');
	if (!location) {
		throw new Error(`No redirect for installer item ${id} (HTTP ${redirect.status})`);
	}

	const releaseNotesUrl = `${site}${latest.path}`;
	const post = await text(releaseNotesUrl);
	const {
		groups: [entry],
	} = match(post, /class="eMessage">[\s\S]*?<p>([\s\S]*?)(?:<br>\s*)*<a href="[^"]*\/load\/doom_explorer\/4">/);

	return {
		version,
		urls: () => [
			{
				url: new URL(location, site).href,
				architecture: 'x64',
				nestedInstallerMatches: ['_Setup.exe'],
			},
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry.replace(/<a [^>]*>([^<]*)<\/a>/g, '$1'))}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});
