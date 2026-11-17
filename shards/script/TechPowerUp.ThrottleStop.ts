import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// TechPowerUp serves downloads through a mirror-selection form whose redirect carries a short-lived token,
// so the installer URL is resolved from the form on every run.
const PAGE = 'https://www.techpowerup.com/download/techpowerup-throttlestop/';

export default defineShard(async () => {
	const page = await fetch(PAGE).then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /ThrottleStop_(?<version>\d+(?:\.\d+)+)\.zip/i, 'No ThrottleStop version found');
	const {
		captures: { id },
	} = match(page, /<input[^>]*name="id"[^>]*value="(?<id>\d+)"/i, 'No ThrottleStop download id found');
	const {
		captures: { server },
	} = match(page, /name="server_id"[^>]*value="(?<server>\d+)"/i, 'No TechPowerUp mirror found');

	return {
		version,
		urls: async () => {
			const response = await fetch(PAGE, {
				method: 'POST',
				body: new URLSearchParams({ id, server_id: server }),
				redirect: 'manual',
			});
			const url = response.headers.get('location');
			if (!url) throw new Error(`No ThrottleStop ${version} download redirect (HTTP ${response.status})`);
			return [url];
		},
		releaseNotes: { releaseNotesUrl: PAGE },
	};
});
