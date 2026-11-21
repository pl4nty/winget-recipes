import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// The World Map page links every release's installer as a Dropbox share link with a random id
// (Simon-s-World-Map-{version}-{date}.exe), so the newest one is read from the page. Release notes
// live at /simon-s-world-map-{version with dashes}, where 1.6.0 is published as /simon-s-world-map-1-6.
const site = 'https://www.sdr-radio.com';

export default defineShard(async () => {
	const page = await ky(`${site}/world-map`, { timeout: 60_000 }).text();
	const latest = [
		...page.matchAll(
			/href="(https:\/\/www\.dropbox\.com\/scl\/fi\/[^"]+\/Simon-s-World-Map-(\d+(?:\.\d+)+)-[^"]+\.exe\?[^"]+)"/g,
		),
	]
		.map(([, url, version]) => ({ url: url!, version: version! }))
		.sort((a, b) => compareVersions(a.version, b.version))
		.at(-1);
	if (!latest) {
		throw new Error('No Simon-s-World-Map installer link found');
	}
	const url = latest.url.replaceAll('&amp;', '&').replace(/([?&])dl=0\b/, '$1dl=1');
	const slug = latest.version.replaceAll('.', '-');
	const notes = page.includes(`href="/simon-s-world-map-${slug}"`) ? slug : slug.replace(/-0$/, '');

	return {
		version: latest.version,
		urls: () => [url],
		releaseNotes: {
			releaseNotesUrl: `${site}/simon-s-world-map-${notes}`,
		},
	};
});
