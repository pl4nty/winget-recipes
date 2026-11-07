import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const page = 'https://www.techpowerup.com/download/techpowerup-nvcleanstall/';

// Reads a form field's value whatever the attribute order is.
function field(form: string, name: string) {
	for (const tag of form.match(/<(?:input|button)\b[^>]*>/g) ?? []) {
		if (!new RegExp(`name=["']${name}["']`).test(tag)) continue;
		const value = /value=["']([^"']+)["']/.exec(tag)?.[1];
		if (value) return value;
	}
	throw new Error(`download form has no ${name}: ${JSON.stringify(form.slice(0, 1500))}`);
}

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const {
		groups: [version],
	} = match(html, /NVCleanstall[ _]v?(\d+\.\d+\.\d+)/);

	// Downloading takes two posts back to the page: the file id returns the mirror list, and
	// the file id plus a mirror id redirects to the file.
	const form = (html: string) => /<form\b[^>]*method=["']?post[\s\S]*?<\/form>/i.exec(html)?.[0] ?? html;
	const id = field(form(html), 'id');
	const mirrors = await fetch(page, { method: 'POST', body: new URLSearchParams({ id }) }).then((response) =>
		response.text(),
	);
	const server = field(mirrors, 'server_id');

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
