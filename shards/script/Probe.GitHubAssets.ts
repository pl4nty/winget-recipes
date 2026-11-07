import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"132": ["Azure", "Azure-Media-Services-Explorer"], "4254": ["portforge", "portforge-app"], "5076": ["RangS-1", "Ferminal"], "5275": ["Seinra", "lexicon-guard"], "5628": ["Whiteknight", "Mdq"], "5875": ["VibeSmiths", "HeatSync"], "5371": ["Samurai-X-13", "Jacked"], "5765": ["TheServer-lab", "DoScript"], "2147": ["fafarunner", "fafarunner"], "3538": ["picguard", "picguard"], "5068": ["louiss0", "mace"]};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	await Promise.all(
		Object.entries(repos).map(async ([id, [owner, repo]]) => {
			try {
				const { data } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 100 });
				const { data: info } = await githubClient.rest.repos.get({ owner, repo }).catch((e) => ({ data: { full_name: String(e), archived: null } }));
				out[id] = { repo: info.full_name, archived: info.archived, releases: data.filter((r) => !r.draft).map((r) => ({ tag: r.tag_name, pre: r.prerelease, assets: r.assets.map((a) => a.name) })).slice(0, 6) };
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
