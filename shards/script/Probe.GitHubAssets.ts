import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"4301": ["bonnie-boni", "CLI_stream"], "4017a": ["mrenanpx", "yama-pdv"], "4017b": ["mrenanpx", "app-yama-print.js"], "4805": ["solnsu", "soln-installer-releases"], "5780": ["29thnight", "PrSM-for-Unity"], "4646": ["bsnes-emu", "bsnes"]};

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
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});
