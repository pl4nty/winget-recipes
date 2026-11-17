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
	const form = /<form[^>]*method="post"[\s\S]*?<\/form>/i.exec(page)?.[0];
	if (!form) throw new Error(`No ThrottleStop download form: ${page.slice(0, 2000)}`);
	const fields = Object.fromEntries(
		[...form.matchAll(/<input[^>]*name="(?<name>[^"]+)"[^>]*value="(?<value>[^"]*)"/gi)].map((m) => [m.groups!.name, m.groups!.value]),
	);
	const server = /<button[^>]*name="(?<name>[^"]+)"[^>]*value="(?<value>[^"]+)"/i.exec(form)?.groups;
	if (!server) throw new Error(`No TechPowerUp mirror in form: ${form.slice(0, 2000)}`);

	return {
		version,
		urls: async () => {
			const response = await fetch(PAGE, {
				method: 'POST',
				body: new URLSearchParams({ ...fields, [server.name]: server.value }),
				redirect: 'manual',
			});
			const url = response.headers.get('location');
			if (!url) throw new Error(`No ThrottleStop ${version} download redirect (HTTP ${response.status}); form: ${form.slice(0, 2000)}`);
			return [new URL(url, PAGE).href];
		},
		releaseNotes: { releaseNotesUrl: PAGE },
	};
});
