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
	for (const url of ['https://tapatch.com/tools.json', 'https://tapatch.com/api/tools', 'https://tapatch.com/tools/tahub/', 'https://tapatch.com/downloads/TAHub-Setup-1.0.2.exe']) {
		try {
			const response = await fetch(url);
			const text = await response.text();
			out[url] = [response.status, response.headers.get('content-type'), response.headers.get('server'), text.length, text.slice(0, 200), ...(text.match(/[^<>"]{0,60}(?:tahub|TAHub-Setup)[^<>"]{0,60}/gi) ?? []).slice(0, 10)];
		} catch (error) {
			out[url] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
