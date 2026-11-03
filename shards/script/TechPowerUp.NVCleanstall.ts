import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const page = 'https://www.techpowerup.com/download/techpowerup-nvcleanstall/';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [version],
	} = match(html, /NVCleanstall[ _]v?(\d+\.\d+\.\d+)/);

	// The download buttons post the file id and a mirror id back to the page, which redirects to the file.
	const {
		groups: [id],
	} = match(html, /name="id" value="(\d+)"/, 'download form id not found');
	const {
		groups: [server],
	} = match(html, /name="server_id" value="(\d+)"/, 'download form server_id not found');

	return {
		version,
		urls: async () => {
			const response = await fetch(page, {
				method: 'POST',
				body: new URLSearchParams({ id, server_id: server }),
				redirect: 'manual',
			});
			const location = response.headers.get('location');
			if (!location) throw new Error(`download form returned ${response.status} without a redirect`);
			return [new URL(location, page).href];
		},
	};
});
