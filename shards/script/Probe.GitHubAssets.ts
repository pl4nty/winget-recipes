import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	await Promise.all(
		Object.entries(repos).map(async ([id, [owner, repo]]) => {
			try {
				const { data } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 100 });
				out[id] = data.filter((r) => !r.draft).map((r) => ({ tag: r.tag_name, pre: r.prerelease, name: r.name, date: r.published_at, body: (r.body ?? '').slice(0, 300), assets: r.assets.map((a) => `${a.name} ${a.updated_at}`) }));
			} catch (error) {
				out[id] = String(error);
			}
		}),
	);
	for (const url of ['https://www.passmark.com/products/fragger/', 'https://www.passmark.com/downloads/']) {
		try {
			const response = await fetch(url);
			const text = await response.text();
			out[url] = [response.status, ...(text.match(/[^<>]{0,80}(?:fragger|version|build)[^<>]{0,80}/gi) ?? []).filter((line) => /fragger|\d\.\d/i.test(line)).slice(0, 25)];
		} catch (error) {
			out[url] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
