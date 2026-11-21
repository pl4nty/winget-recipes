import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// TechPowerUp serves downloads through a form that first asks for a mirror and then redirects
// to a short-lived tokenized URL, so the installer URL is resolved from the form on every run.
const PAGE = 'https://www.techpowerup.com/download/techpowerup-throttlestop/';

export default defineShard(async () => {
	const page = await fetch(PAGE).then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /ThrottleStop_(?<version>\d+(?:\.\d+)+)\.zip/i, 'No ThrottleStop version found');
	const {
		captures: { id },
	} = match(page, /class="download-version-form"[\s\S]*?name="id" value="(?<id>\d+)"/i, 'No ThrottleStop download id found');

	return {
		version,
		urls: async () => {
			const post = (body: Record<string, string>) =>
				fetch(PAGE, { method: 'POST', body: new URLSearchParams(body), redirect: 'manual' });
			let response = await post({ id });
			let location = response.headers.get('location');
			if (!location) {
				const mirrors = await response.text();
				const {
					captures: { server },
				} = match(mirrors, /name="server_id"[^>]*value="(?<server>\d+)"/i, `No TechPowerUp mirror found: ${mirrors.slice(0, 1500)}`);
				response = await post({ id, server_id: server });
				location = response.headers.get('location');
			}
			if (!location) throw new Error(`No ThrottleStop ${version} download redirect (HTTP ${response.status})`);
			const url = new URL(location, PAGE).href;
			if (!url.includes(`ThrottleStop_${version}.zip`)) throw new Error(`Unexpected ThrottleStop download ${url}`);
			return [url];
		},
		releaseNotes: { releaseNotesUrl: PAGE },
	};
});
